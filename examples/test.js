#!/usr/bin/env node

require('dotenv').load();

var log = require('../log');
var tunerTwitter = require('../tuner_twitter');
var repeaterNull = require('../repeater_null');
var repeaterPushover = require('../repeater_pushover');

var tt = tunerTwitter.create({
    twitterID: 14641869,
    keywords: ['#@batsig'],
    twitterCreds: {
        consumer_key:        process.env.TWITTER_CONSUMER_KEY,
        consumer_secret:     process.env.TWITTER_CONSUMER_SECRET,
        access_token:        process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }
});
log.debug('created new ' + tt.name);

var repeater = repeaterPushover.create({
    pushoverOptions: {
        token: process.env.PUSHOVER_TOKEN,
        user: process.env.PUSHOVER_USER_NA_TEST,
        title: 'TEST'
    }
});
log.debug('created new ' + repeater.name);

repeater.addTuner(tt);
log.debug('added ' + tt.name + ' to ' + repeater.name);
