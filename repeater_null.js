'use strict';

var stampit = require('stampit');

var RepeaterBase = require('./repeater_base');
var log = require('./log');

var RepeaterNull = stampit().state({
    name: 'Null repeater'
});

module.exports = stampit.compose(RepeaterBase, RepeaterNull);
