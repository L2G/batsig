'use strict';

var stampit = require('stampit');

var RepeaterBase = stampit({
    addTuner: function() {
        throw 'addTuner not yet implemented';
    }
},
{
    name: 'Nameless repeater'
});

module.exports = RepeaterBase;
