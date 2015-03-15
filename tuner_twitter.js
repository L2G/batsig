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
    stampit({
        // setup is called externally, e.g. by a repeater
        setup: function setup() {
            if (this.twitterID) {
                log.debug('Already have Twitter ID: ' + this.twitterID);
                this.readyCheck();
            } else {
                this.lookUpTwitterIdFor(this.twitterName);
            }
        },
        // readyCheck is called when a setup function is done.  If everything
        // looks to be in order, it will emit the 'ready' signal.
        readyCheck: function readyCheck() {
            if (!this.twitterID) {
                log.debug("TunerTwitter.readyCheck(): still no twitterID");
            } else if (!this.emit('ready')) {
                // Reaching this point means the 'ready' signal has been
                // emitted, but there were no listeners
                log.error('No one was listening to TwitterReady. Sad face!');
            }
        }
    },
    {
        twitterName: null,
        twitterID:   null,
        keywords:    null
    },
    function() {
        var outerObject = this,
            twitClient = new Twit(twitterCreds);

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
                               outerObject.readyCheck();
                           });
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
            var hashtags = tweet.entities.hashtags;
            outerObject.emit('message', util.inspect(text));
            hashtags.forEach(function (hashtag) {
                outerObject.emit('message', util.inspect(hashtag));
            });
        });
        twitStream.on('disconnect', function (disconnectMessage) {
            outerObject.emit('lost', 'Twitter disconnected with this message: ' + disconnectMessage);
        });

        outerObject.emit('tunedIn');
    };
});
module.exports = TunerTwitter;
