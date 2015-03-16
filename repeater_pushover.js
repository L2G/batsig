'use strict';

var stampit = require('stampit');
var request = require('request');
var util    = require('util');

var RepeaterBase = require('./repeater_base');
var log = require('./log');

var RepeaterPushover = stampit().state({
    name: 'Pushover repeater',
    // pushoverOptions should be an object with parameters for the Pushover
    // Message API. At a minimum it needs to have:
    //     token - application API key
    //     user  - ID of user or group to be receiving messages
    pushoverOptions: {}
});

RepeaterPushover.enclose(function () {
    var repeater = this;
    var pushoverOptions = stampit().state({ priority: 0 })
                                   .state(this.pushoverOptions);
   
    this.messageHandler = function messageHandler(tuner) {
        return function (message) {
            log.info(repeater.name + ' received message from ' + tuner.name +
                     ': ' + message);
            var formData = pushoverOptions.create({'message': message});

            // Note that the 'form' argument causes request.post() to send the
            // data as application/x-www-form-urlencoded (which is what Pushover
            // requires), but it also means that the response body is not
            // automatically parsed as JSON (which is what Pushover always
            // returns).  So we will have to have the body parsed ourselves.
            var postParams = {
                url: 'https://api.pushover.net/1/messages.json',
                form: formData
            };
            log.debug('Sending POST request ' + util.inspect(postParams));
            request.post( postParams, function (error, response, body) {
                log.debug(util.inspect({'error': error, 'response': response, 'body': body}));
                if (error) {
                    log.error(repeater.name + ' received an HTTP error: ' + error);
                } else if (JSON.parse(body).status !== 1) {
                    log.error(repeater.name +
                              ' received an error response from Pushover: ' +
                              util.inspect(body));
                } else {
                    log.info(repeater.name + ' posted message to Pushover');
                }
            });
        };
    };
});

module.exports = stampit.compose(RepeaterBase, RepeaterPushover);
