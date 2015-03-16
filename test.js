var log = require('./log');
var TunerTwitter = require('./tuner_twitter');
var RepeaterNull = require('./repeater_null');

//var tt = TunerTwitter.create({twitterName: 'L2G', keywords: ['test', '@#batsig']});
var tt = TunerTwitter.create({twitterID: 14641869, keywords: ['#@batsig']});
log.debug('created new TunerTwitter');

var repeater = RepeaterNull.create();
log.debug('created new ' + repeater.name);

repeater.addTuner(tt);
log.debug('added tuner to ' + repeater.name);
