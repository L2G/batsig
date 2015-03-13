'use strict';

var stampit = require('stampit');
var Twit = require('twit');
var TunerBase = require('./tuner_base');
var log = require('./log');
var twitterCreds = require('./twitter_creds')();

var TunerTwitter = TunerBase.compose(
    stampit({
        tuneIn: function() {
            if (this.twitterID) {
                log.debug('Already have Twitter ID: ' + this.twitterID);
                return;
            }

            var twitClient = new Twit(twitterCreds);
            var self = this;

            twitClient.get('users/show',
                           { 'screen_name': self.twitterName },
                           function (err, data, response) {
                if (err) {
                    return log.error('Twitter returned an error ' + response);
                }

                log.debug('Looked up Twitter screen name: ' + self.twitterName);
                log.debug('Got ID: ' + data.id);
                self.twitterID = data.id;
                if (self.emit('ready')) { return; }
                return log.error('No one was listening to me! (TunerTwitter)');
            });
        }
    },
    {
        twitterName: null,
        twitterID:   null
    })
);

module.exports = TunerTwitter;
