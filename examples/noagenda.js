#!/usr/bin/env node

var log = require('../log');
var tunerTwitter = require('../tuner_twitter');
var repeaterPushover = require('../repeater_pushover');

var tuner = tunerTwitter.create({
    twitterName: 'adamcurry',
    keywords: ['#batsig', '@#pocketnoagenda']
});
log.debug('created new ' + tuner.name);

var repeater = repeaterPushover.create({
    pushoverOptions: {
        token: process.env.PUSHOVER_TOKEN,
        user: process.env.PUSHOVER_USER_NA_PRODUCERS,
        title: 'TEST'
    }
});
log.debug('created new ' + repeater.name);

repeater.addTuner(tuner);
log.debug('added ' + tuner.name + ' to ' + repeater.name);
