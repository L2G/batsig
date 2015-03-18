#!/usr/bin/env node

var cli = require('commander')
var daemon = require('daemon')

var log = require('./log');
var tunerTwitter = require('./tuner_twitter');
var repeaterNull = require('./repeater_null');
var repeaterPushover = require('./repeater_pushover');

cli.option('-d, --daemon', 'Run as a background process')
   .parse(process.argv);

if (cli.daemon) {
    require('daemon')();
}

var tt = tunerTwitter.create({twitterName: 'L2G', keywords: ['test', '@#batsig']});
//var tt = tunerTwitter.create({twitterID: 14641869, keywords: ['#@batsig']});
log.debug('created new ' + tt.name);

var repeater = repeaterPushover.create({
    pushoverOptions: {
        token: process.env.PUSHOVER_TOKEN,
        user: process.env.PUSHOVER_USER_NA_TEST,
        title: 'TEST'
    }
});
log.debug('created new ' + repeater.name);

repeater.addTuner(tt)
    .then(tt.setup())
    .then(tt.tuneIn());
