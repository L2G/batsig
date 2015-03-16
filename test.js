var log = require('./log');
var TunerTwitter = require('./tuner_twitter');

var tt = TunerTwitter.create({twitterName: 'L2G', keywords: 'test'});
//var tt = TunerTwitter.create({twitterID: 14641869});
log.debug('created new TunerTwitter');
tt.on('ready', function () {
    log.debug('TwitterTuner is ready');
    tt.tuneIn();
});
tt.on('tunedIn', function () {
    log.info('Twitter tuner is tuned in and listening for messages');
});
tt.on('message', function (message) {
    log.info('Message from Twitter: ' + message);
});
tt.on('error', function (message) {
    log.debug('Twitter tuner raised an error: ' + message);
});
tt.on('lost', function (message) {
    log.debug('Twitter tuner lost its signal: ' + message);
});
tt.setup();
