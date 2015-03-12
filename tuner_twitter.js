'use strict';

var stampit = require('stampit');
var Twit = require('twit');

var log = require('./log');
var twitterCreds = require('./twitter_creds')();

var TunerTwitter = stampit(
    {
        tuneIn: function() {
            if (this.twitterID) {
                log.debug('Already have Twitter ID: ' + this.twitterID);
                return;
            }

            var twitClient = new Twit(twitterCreds);
            var that = this;

            twitClient.get('users/show',
                           { 'screen_name': that.twitterName },
                           function (err, data, response) {
                if (err) {
                    return log.error('Twitter returned an error ' + response);
                }

                log.debug('Looked up Twitter screen name: ' + that.twitterName);
                log.debug('Got ID: ' + data.id);
                that.twitterID = data.id;
            });
        }
    },
    {
        twitterName: null,
        twitterID:   null
    }
);

module.exports = TunerTwitter;
