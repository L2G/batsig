var log = require('./log');
var TunerTwitter = require('./tuner_twitter');

var tt = new TunerTwitter();
tt.tuneIn({screen_name: 'L2G'});
log.debug('tuneIn just returned');
