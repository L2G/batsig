#!/usr/bin/env node

require('dotenv').load();

var log = require('../log');
var tunerTwitter = require('../tuner_twitter');
var repeaterPushover = require('../repeater_pushover');

var tuner = tunerTwitter.create({
    twitterName: 'adamcurry',
    keywords: ['#batsig', '#@pocketnoagenda'],
    twitterCreds: {
        consumer_key:        process.env.TWITTER_CONSUMER_KEY,
        consumer_secret:     process.env.TWITTER_CONSUMER_SECRET,
        access_token:        process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }
});
log.debug('created new ' + tuner.name);

var repeater = repeaterPushover.create({
    pushoverOptions: {
        token: process.env.PUSHOVER_TOKEN,
        user: process.env.PUSHOVER_USER_NA_PRODUCERS
    }
});
log.debug('created new ' + repeater.name);

repeater.addTuner(tuner);
log.debug('added ' + tuner.name + ' to ' + repeater.name);
