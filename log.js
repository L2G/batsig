'use strict';

exports.info = function (msg) {
    return console.log('I ' + msg);
};

exports.debug = function (msg) {
    if (process.env.DEBUG) {
        return console.log('D ' + msg);
    }
};

exports.error = function (msg) {
    return console.error('E ' + msg);
};

