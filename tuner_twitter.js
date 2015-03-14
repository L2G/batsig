'use strict';

var stampit = require('stampit');
var Twit = require('twit');
var TunerBase = require('./tuner_base');
var log = require('./log');
var twitterCreds = require('./twitter_creds')();

var TunerTwitter = TunerBase.compose(
    stampit({
        setup: function setup() {
            if (this.twitterID) {
                log.debug('Already have Twitter ID: ' + this.twitterID);
                this.tunerReady();
            } else {
                this.lookUpTwitterIdFor(this.twitterName);
            }
        },
        tuneIn: function tuneIn() {
            log.debug('TunerTwitter.tuneIn() called');
            return;
        },
        tunerReady: function tunerReady() {
            if (!this.twitterID) {
                log.error("TunerTwitter.tunerReady() called, but there's still no twitterID!");
            } else if (!this.emit('ready')) {
                log.error('No one was listening to TwitterReady. Sad face!');
            }
        }
    },
    {
        twitterName: null,
        twitterID:   null
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
                               outerObject.tunerReady();
                           });
        };
    })
);

module.exports = TunerTwitter;
