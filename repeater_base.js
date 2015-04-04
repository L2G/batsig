'use strict';

var stampit = require('stampit');
var log = require('./log');

var repeaterBase = stampit({
    readyHandler: function readyHandler(tuner) {
        return function () {
            log.info(tuner.name + ' reports it is ready');
        };
    },
    tunedInHandler: function tunedInHandler(tuner) {
        return function () {
            log.info(tuner.name + ' is tuned in');
        };
    },
    messageHandler: function messageHandler(tuner) {
        var repeater = this;
        return function (message) {
            log.info(repeater.name + ' received message from ' + tuner.name +
                     ': ' + message);
        };
    },
    errorHandler: function errorHandler(tuner) {
        return function (message) {
            log.error(tuner.name + ' raised an error: ' + message);
        };
    },
    lostHandler: function lostHandler(tuner) {
        return function (message) {
            log.error(tuner.name + ' lost its connection: ' + message);
        };
    },
    addTuner: function addTuner(tuner) {
        log.info(this.name + ' is adding new tuner');
        tuner.on('ready',   this.readyHandler(tuner));
        tuner.on('tunedIn', this.tunedInHandler(tuner));
        tuner.on('message', this.messageHandler(tuner));
        tuner.on('error',   this.errorHandler(tuner));
        tuner.on('lost',    this.lostHandler(tuner));
    },
},
{
    name: 'Nameless repeater'
});

module.exports = repeaterBase;
