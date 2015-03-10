'use strict';

var Log = {
    info: function (msg) {
        return console.log('I ' + msg);
    },

    debug: function (msg) {
        if (process.env.DEBUG) {
            return console.log('D ' + msg);
        }
    },

    error: function (msg) {
        return console.error('E ' + msg);
    }
};

module.exports = Log;
