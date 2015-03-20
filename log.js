'use strict';

require('dotenv').load();

var winston = require('winston'),
    defaultLevel = 'info';

if (process.env.DEBUG) {
    defaultLevel = 'debug';
}

var log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: defaultLevel,
            colorize: true
        })
    ]
});

module.exports = log;
