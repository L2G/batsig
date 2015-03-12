'use strict';

var Twit = require('twit');
var log = require('./log');
var twitterCreds = require('./twitter_creds')();

var gotTwitterID = function (id) {
    log.info('gotTwitterID called with ' + id);
};

function TunerTwitter() {
    return this;
}

TunerTwitter.prototype.tuneIn = function (args) {
    var twitterName = args.screen_name;

    var twitClient = new Twit(twitterCreds);
    twitClient.get('users/show', { 'screen_name': twitterName }, function (err, data, response) {
        if (err) {
            return log.error('Twitter returned an error ' + response);
        }

        log.debug('Looked up Twitter screen name: ' + twitterName);
        log.debug('Got ID: ' + data.id);
        gotTwitterID(data.id);
    });
};

module.exports = TunerTwitter;
