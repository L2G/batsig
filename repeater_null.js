'use strict';

var stampit = require('stampit');

var RepeaterBase = require('./repeater_base');
var log = require('./log');

var RepeaterNull = stampit({
    addTuner: function addTuner(tuner) {
        log.info('Null repeater is adding new tuner');
        tuner.on('ready', function () {
            log.info('Tuner reports it is ready; now tuning in');
            tuner.tuneIn();
        });
        tuner.on('tunedIn', function () {
            log.info('Tuner is tuned in');
        });
        tuner.on('message', function (message) {
            log.info('Received message ' + message);
        });
        tuner.on('error', function (message) {
            log.error('Tuner raised an error: ' + message);
        });
        tuner.on('lost', function (message) {
            log.error('Tuner lost its connection: ' + message);
        });
        tuner.setup();
    }
});

module.exports = stampit.compose(RepeaterBase, RepeaterNull);
