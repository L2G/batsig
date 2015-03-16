'use strict';

var stampit = require('stampit');

var RepeaterBase = require('./repeater_base');
var log = require('./log');

var RepeaterNull = stampit({
    readyHandler: function readyHandler(tuner) {
        var repeater = this;
        return function () {
            log.info('Tuner reports it is ready; ' +
                     repeater.name + ' is now tuning it in');
            tuner.tuneIn();
        };
    },
    tunedInHandler: function tunedInHandler(tuner) {
        return function () {
            log.info('Tuner is tuned in');
        };
    },
    messageHandler: function messageHandler(tuner) {
        var repeater = this;
        return function (message) {
            log.info(repeater.name + ' received message: ' + message);
        };
    },
    errorHandler: function errorHandler(tuner) {
        return function (message) {
            log.error('Tuner raised an error: ' + message);
        };
    },
    lostHandler: function lostHandler(tuner) {
        return function (message) {
            log.error('Tuner lost its connection: ' + message);
        };
    },
    addTuner: function addTuner(tuner) {
        log.info(this.name + ' is adding new tuner');
        tuner.on('ready',   this.readyHandler(tuner));
        tuner.on('tunedIn', this.tunedInHandler(tuner));
        tuner.on('message', this.messageHandler(tuner));
        tuner.on('error',   this.errorHandler(tuner));
        tuner.on('lost',    this.lostHandler(tuner));
        tuner.setup();
    },
},
{
    name: 'Null repeater'
});

module.exports = stampit.compose(RepeaterBase, RepeaterNull);
