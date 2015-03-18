#!/usr/bin/env node

var cli = require('commander')
var daemon = require('daemon')

var log = require('./log');
var TunerTwitter = require('./tuner_twitter');
var RepeaterNull = require('./repeater_null');
var RepeaterPushover = require('./repeater_pushover');

cli.option('-d, --daemon', 'Run as a background process')
   .parse(process.argv);

if (cli.daemon) {
    require('daemon')();
}

//var tt = TunerTwitter.create({twitterName: 'L2G', keywords: ['test', '@#batsig']});
var tt = TunerTwitter.create({twitterID: 14641869, keywords: ['#@batsig']});
log.debug('created new ' + tt.name);

var repeater = RepeaterPushover.create({
    pushoverOptions: {
        token: process.env.PUSHOVER_TOKEN,
        user: process.env.PUSHOVER_USER_NA_TEST,
        title: 'TEST'
    }
});
log.debug('created new ' + repeater.name);

repeater.addTuner(tt);
log.debug('added ' + tt.name + ' to ' + repeater.name);
