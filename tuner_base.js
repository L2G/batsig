'use strict';

var stampit = require('stampit');

var TunerBase = stampit({
    tuneIn: function() {
        throw 'tuneIn not yet implemented';
    }
});

module.exports = TunerBase;
