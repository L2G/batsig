'use strict';

var stampit = require('stampit');

var EventEmitter = stampit.convertConstructor(
    require('events').EventEmitter
);

var TunerBase = stampit({
    tuneIn: function() {
        throw 'tuneIn not yet implemented';
    }
});

module.exports = stampit.compose(EventEmitter, TunerBase);
