'use strict';

// Node libs
var stampit = require('stampit');
var Twit = require('twit');
var util = require('util');

// Local libs
var log = require('./log');
var TunerBase = require('./tuner_base');
var twitterCreds = require('./twitter_creds')();

var TunerTwitter = TunerBase.compose(
    stampit().state({
        name:        'Twitter tuner',
        twitterName: null,
        twitterID:   null,
        keywords:    null
    }).enclose(function () {
        var outerObject = this,
            twitClient = new Twit(twitterCreds);

        var readyCheck = function readyCheck() {
            if (!outerObject.twitterID) {
                log.debug('TunerTwitter.readyCheck(): need twitterID');
                outerObject.lookUpTwitterIdFor(outerObject.twitterName);
            } else if (!outerObject.regex) {
                log.debug('TunerTwitter.readyCheck(): have twitterID but no keyword regex yet');
                outerObject.convertKeywordsToRegex();
            } else {
                log.debug('TunerTwitter.readyCheck(): ready!');
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
                log.debug('TunerTwitter has no keywords to match; will match all tweets from user');
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
TunerTwitter.enclose(function () {
    var outerObject = this,
        twitClient = new Twit(twitterCreds),
        twitStream = null;

    this.tuneIn = function tuneIn () {
        twitStream = twitClient.stream('statuses/filter', { follow: outerObject.twitterID });
        twitStream.on('tweet', function (tweet) {
            // The tweet object contains these properties of interest to us:
            //
            // text - the plain text of the tweet
            // entities.hashtags - an array of 0 or more objects representing
            //     hashtags parsed from the text:
            //         text - the plain text of the hashtag, WITHOUT the hash
            //             sign
            //         indicies - array of 2 integers representing the range
            //             within the tweet's text where the hashtag is found,
            //             INCLUDING the hash sign; these integers have the same
            //             meaning as arguments to the string slice() method
            //
            var text = tweet.text;
            var regex = outerObject.regex;
            log.debug('Received tweet: ' + util.inspect(text));
            if (text.search(regex) > -1) {
                log.debug('Found a match with regexp ' + util.inspect(regex));
                outerObject.emit('message', util.inspect(text));
            } else {
                log.debug('Did not match regexp ' + util.inspect(regex));
            }
        });
        twitStream.on('disconnect', function (disconnectMessage) {
            outerObject.emit('lost', 'Twitter disconnected with this message: ' + disconnectMessage);
        });

        outerObject.emit('tunedIn');
    };
});
module.exports = TunerTwitter;
