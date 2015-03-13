var log = require('./log');
var TunerTwitter = require('./tuner_twitter');

var tt = TunerTwitter.create({twitterName: 'L2G'});
log.debug('created new TunerTwitter');
tt.tuneIn();
tt.on('ready', function () {
    log.info('TunerTwitter says it is ready');
})
