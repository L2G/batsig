var log = require('./log');
var TunerTwitter = require('./tuner_twitter');

var tt = TunerTwitter.create({twitterName: 'L2G'});
//var tt = TunerTwitter.create({twitterID: 14641869});
log.debug('created new TunerTwitter');
tt.on('ready', function () {
    log.debug('TwitterTuner is ready');
    tt.tuneIn();
});
tt.setup();
