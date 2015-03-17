'use strict';

// Node libs
var stampit = require('stampit');
var util = require('util');
var Promise = require('promise');
var Twit = require('twit');

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
            name = this.twitterName,
            twitClient = new Twit(twitterCreds);

        function lookUpTwitterID() {
            return new Promise(function (resolve, reject) {
                if (tuner.twitterID) {
                    log.debug(tuner.name + ' already has Twitter ID '
                              + tuner.twitterID);
                    resolve(tuner.twitterID);
                } else {
                    var twitGetFunction = function (err, data, response) {
                        if (err) {
                            reject('Twitter returned an error: ' + response);
                        } else {
                            log.debug('Looked up Twitter screen name: ' + name);
                            log.debug('Got ID: ' + data.id);
                            tuner.twitterID = data.id;
                            resolve(data.id);
                        }
                    };

                    twitClient.get( 'users/show',
                                    { 'screen_name': name },
                                    twitGetFunction );
                }
            });
        }

        function convertKeywordsToRegex() {
            var sanitizedKeywords;

            return new Promise(function (resolve, reject) {
                if (tuner.regex) {
                    log.debug(tuner.name + ' already has a regex '
                              + 'for matching keywords');
                } else if (!tuner.keywords) {
                    log.debug('TunerTwitter has no keywords to match; '
                              + 'will match all tweets from user');
                    tuner.regex = new RegExp('(?:.)');
                } else {
                    log.debug('Keywords to be matched: '
                              + util.inspect(tuner.keywords));

                    // Escape characters in keywords for safety in a regular
                    // expression
                    sanitizedKeywords = tuner.keywords.map(function (keyword) {
                        return keyword.replace(/[^a-z0-9_@#\-]/g, '\\$&')
                                      .replace(/^\w/, '\\b$&')
                                      .replace(/\w$/, '$&\\b');
                    });

                    log.debug('Sanitized for regular expression: '
                              + util.inspect(sanitizedKeywords));

                    // Join multiple keywords into a single regex
                    tuner.regex = new RegExp(
                        '(?:' + sanitizedKeywords.join('|') + ')'
                    );
                }
                log.debug('Regular expression: '
                          + util.inspect(tuner.regex));
                resolve(tuner.regex);
            });
        }

        // setup is called externally, e.g. by a repeater
        this.setup = function setup() {
            return Promise.all([
                lookUpTwitterID(),
                convertKeywordsToRegex()
            ]).then(function () {
                log.debug(tuner.name + ' is ready');
                if (!tuner.emit('ready')) {
                    // Reaching this point means the 'ready' signal has been
                    // emitted, but there were no listeners
                    log.warn('No one is listening to ' + tuner.name
                             + '. Sad face!');
                }
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
            twitStream.on('error', function (error) {
                var errorMessage = 'Twitter returned an error: '
                           + util.inspect(error);

                log.error(errorMessage);
                tuner.emit('error', errorMessage);
            });

            resolve(twitStream);
        }).then(function () {
            tuner.emit('tunedIn');
        });
    };
});

module.exports = TunerTwitter;
