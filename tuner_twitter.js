'use strict';

// Node libs
var replaceAll = require('underscore.string/replaceAll');
var stampit = require('stampit');
var Twit = require('twit');
var util = require('util');

// Local libs
var log = require('./log');
var tunerBase = require('./tuner_base');

var tunerTwitter = tunerBase.compose(
    stampit().state({
        name:         'Twitter tuner',
        twitterName:  null,
        twitterID:    null,
        keywords:     null,
        twitterCreds: {}
    }).enclose(function () {
        var outerObject = this,
            twitClient = new Twit(this.twitterCreds);

        var readyCheck = function readyCheck() {
            if (!outerObject.twitterID) {
                log.debug('tunerTwitter.readyCheck(): need twitterID');
                outerObject.lookUpTwitterIdFor(outerObject.twitterName);
            } else if (!outerObject.regex) {
                log.debug('tunerTwitter.readyCheck(): have twitterID but no keyword regex yet');
                outerObject.convertKeywordsToRegex();
            } else {
                log.debug('tunerTwitter.readyCheck(): ready!');
                if (!outerObject.emit('ready')) {
                    // Reaching outerObject point means the 'ready' signal has been
                    // emitted, but there were no listeners
                    log.error('No one was listening to TwitterReady. Sad face!');
                }
            }
        };

        // setup is called externally, e.g. by a repeater
        this.setup = function setup() {
            return readyCheck();
        };

        this.lookUpTwitterIdFor = function lookUpTwitterIdFor(name) {
            twitClient.get('users/show',
                           { 'screen_name': name },
                           function (err, data, response) {
                               if (err) {
                                   return log.error('Twitter returned an error ' + response);
                               }
                               log.debug('Looked up Twitter screen name: ' + name);
                               log.debug('Got ID: ' + data.id);
                               outerObject.twitterID = data.id;
                               readyCheck();
                           });
        };

        this.convertKeywordsToRegex = function convertKeywordsToRegex() {
            var sanitizedKeywords, keywordRegex;

            // No need to do any work if there are no keywords
            if (!this.keywords) {
                log.debug('tunerTwitter has no keywords to match; will match all tweets from user');
                keywordRegex = new RegExp('(?:.)');
            } else {
                log.debug('Keywords to be matched: ' + util.inspect(this.keywords));

                // Escape characters in keywords for safety in a regular expression
                sanitizedKeywords = this.keywords.map(function (keyword) {
                    return keyword.replace(/[^a-z0-9_@#\-]/g, '\\$&')
                                  .replace(/^\w/, '\\b$&')
                                  .replace(/\w$/, '$&\\b');
                });

                log.debug('Sanitized for regular expression: ' + util.inspect(sanitizedKeywords));

                // Join multiple keywords into a single regex
                keywordRegex = new RegExp('(?:' + sanitizedKeywords.join('|') + ')');
            }

            this.regex = keywordRegex;
            log.debug('Generated regular expression: ' + util.inspect(this.regex));

            // Finished, so check to see if everything else has been set up
            readyCheck();
        };
    })
);
tunerTwitter.enclose(function () {
    var outerObject = this,
        twitClient = new Twit(this.twitterCreds);

    // Takes the text and the "urls" entity from a tweet, and returns the text
    // with all t.co URLs substituted with their originals.  See
    // filterAndEmitTweet().
    function substituteTwitterUrls(text, urls) {
        var restoredText = text;
        urls.forEach(function (urlObj) {
            log.debug(urlObj);
            log.debug('Substituting ' + urlObj.url + ' -> ' + urlObj.expanded_url);
            restoredText = replaceAll(restoredText, urlObj.url, urlObj.expanded_url);
        });
        return restoredText;
    }

    function filterAndEmitTweet(tweet) {
        // The tweet object contains these properties of interest to us
        // (see https://dev.twitter.com/overview/api/tweets):
        //
        // text - the plain text of the tweet
        //
        // user.id - integer of the numeric Twitter ID of the user sending this
        //     tweet (this CAN be different than the Twitter user being followed
        //     by the stream... *sigh*)
        //
        // user.id_str - id (see above) as a string; it will be necessary to use
        //     the string instead of the integer at some point, probably when
        //     Twitter IDs rise above 2^31 - 1
        //
        // retweeted_status - true if this is a retweet, false if not
        //
        // entities.hashtags - an array of 0 or more objects representing
        //     hashtags parsed from the text:
        //         text - the plain text of the hashtag, WITHOUT the hash
        //             sign
        //         indicies - array of 2 integers representing the range
        //             within the tweet's text where the hashtag is found,
        //             INCLUDING the hash sign; these integers have the same
        //             meaning as arguments to the string slice() method
        //
        // entities.urls - an array of 0 or more objects representing URLs
        //     parsed from the text and replaced with Twitter's click-tracking
        //     URLs (t.co domain):
        //         url - the http://t.co URL appearing in the text
        //         expanded_url - the actual URL referenced by the t.co URL
        //             (including "http://" even if not included in the
        //             original tweet)
        //         display_url - the abbreviated URL as displayed by Twitter
        //             ("http://" and "http://www." are dropped even if they
        //             were in the original tweet)
        //         indices - pair of integers representing the substring range
        //             of the t.co URL within the text
        //
        var text = tweet.text;
        var regex = outerObject.regex;
        log.debug('Received tweet:');
        log.debug(util.inspect(tweet));

        // TODO: break all these checks out into separate, maybe even async functions

        log.debug('Checking if this is from twitter ID ' + outerObject.twitterID);
        if (tweet.user.id !== outerObject.twitterID) {
            return log.debug('It is not; ignoring');
        }
        log.debug('Yes, it is');

        log.debug('Now checking if this is an original tweet or a retweet');
        if (tweet.retweeted_status) {
            return log.debug('This is a retweet; ignoring');
        }
        log.debug('This is original');

        log.debug('Now checking for a match with regexp ' + util.inspect(regex));
        if (text.search(regex) <= -1) {
            return log.debug('No match; ignoring');
        }
        log.debug("Yes, it's a match");

        // Replace t.co URLs in the text before emitting the message
        outerObject.emit('message', substituteTwitterUrls(text, tweet.entities.urls));
    }

    function handleError(err) {
        outerObject.emit('error', err);
    }

    function handleDisconnect(message) {
        outerObject.emit('lost', 'Twitter disconnected with this message: ' + message);
    }

    function startStream() {
        var twitStream = twitClient.stream('statuses/filter', { follow: outerObject.twitterID });
        twitStream.on('error', handleError);
        twitStream.on('tweet', filterAndEmitTweet);
        twitStream.on('disconnect', handleDisconnect);
        return twitStream;
    }

    this.tuneIn = function tuneIn () {
        startStream();
        outerObject.emit('tunedIn');
    };

    this.start = this.tuneIn;
});
module.exports = tunerTwitter;
