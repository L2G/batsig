'use strict';

var stampit = require('stampit');

var repeaterBase = require('./repeater_base');
var log = require('./log');

var repeaterNull = stampit().state({
    name: 'Null repeater'
});

module.exports = stampit.compose(repeaterBase, repeaterNull);
