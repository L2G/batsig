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
        var tuner = this,
            twitClient = new Twit(twitterCreds);

        // setup is called externally, e.g. by a repeater
        this.setup = function setup() {
            return Promise.all([
                lookupTwitterID(),
                convertKeywordsToRegex()
            ]).then({
                log.debug(tuner.name + ' is ready');
                if (!tuner.emit('ready')) {
                    // Reaching this point means the 'ready' signal has been
                    // emitted, but there were no listeners
                    log.warn('No one is listening to ' + tuner.name
                             + '. Sad face!');
            });
        };

        this.lookUpTwitterId = function lookUpTwitterId() {
            return new Promise(function (resolve, reject) {
                twitClient.get(
                    'users/show',
                    { 'screen_name': name },
                    function (err, data, response) {
                        if (err) {
                            reject('Twitter returned an error: ' + response);
                        } else {
                            log.debug('Looked up Twitter screen name: ' + name);
                            log.debug('Got ID: ' + data.id);
                            tuner.twitterID = data.id;
                            resolve(data.id);
                        }
                    }
                );
            };
        };

        this.convertKeywordsToRegex = function convertKeywordsToRegex() {
            var sanitizedKeywords, keywordRegex;

            return new Promise(function (resolve, reject) {
                // No need to do any work if there are no keywords
                if (!this.keywords) {
                    log.debug('TunerTwitter has no keywords to match; '\
                              'will match all tweets from user');
                    keywordRegex = new RegExp('(?:.)');
                } else {
                    log.debug('Keywords to be matched: ' + util.inspect(this.keywords));

                    // Escape characters in keywords for safety in a regular expression
                    sanitizedKeywords = this.keywords.map(function (keyword) {
                        return keyword.replace(/[^a-z0-9_@#\-]/g, '\\$&')
                                      .replace(/^\w/, '\\b$&')
                                      .replace(/\w$/, '$&\\b');
                    });

                    log.debug('Sanitized for regular expression: '
                              + util.inspect(sanitizedKeywords));

                    // Join multiple keywords into a single regex
                    keywordRegex = new RegExp(
                        '(?:' + sanitizedKeywords.join('|') + ')'
                    );
                }

                this.regex = keywordRegex;
                log.debug('Generated regular expression: ' + util.inspect(this.regex));
                resolve(this.regex);
            });
        };
    })
);
TunerTwitter.enclose(function () {
    var tuner = this,
        twitClient = new Twit(twitterCreds),
        twitStream = null;

    this.tuneIn = function tuneIn () {
        return new Promise(function (resolve, reject) {
            twitStream = twitClient.stream('statuses/filter',
                             { follow: tuner.twitterID }
                         );
            twitStream.on('tweet', function (tweet) {
                // The tweet object contains these properties of interest to us:
                //
                // text - the plain text of the tweet
                // entities.hashtags - an array of 0 or more objects
                //     representing hashtags parsed from the text:
                //         text - the plain text of the hashtag, WITHOUT the
                //             hash sign
                //         indicies - array of 2 integers representing the range
                //             within the tweet's text where the hashtag is
                //             found, INCLUDING the hash sign; these integers
                //             have the same meaning as arguments to the string
                //             slice() method
                //
                var text = tweet.text;
                var regex = tuner.regex;
                log.debug('Received tweet: ' + util.inspect(text));
                if (text.search(regex) > -1) {
                    log.debug('Found a match with regexp ' + util.inspect(regex));
                    tuner.emit('message', text);
                } else {
                    log.debug('Did not match regexp ' + util.inspect(regex));
                }
            });
            twitStream.on('disconnect', function (disconnectMessage) {
                tuner.emit('lost', 'Twitter disconnected with this message: '
                           + disconnectMessage);
            });

            resolve(twitStream);
        }).then(function () {
            tuner.emit('tunedIn');
        });
    };
});

module.exports = TunerTwitter;
