#!/usr/bin/env node
var Twit = require('twit')

var log = require('./log.js')

var listen = {
  new_twit: function() {
    return new Twit({
      consumer_key:        process.env.TWITTER_CONSUMER_KEY,
      consumer_secret:     process.env.TWITTER_CONSUMER_SECRET,
      access_token:        process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });
  }
  ,
  go: function() {
    var t = this.new_twit();
    var tw_user = 'adamcurry';
    var tw_id;

    t.get('users/show', { 'screen_name': tw_user }, function(err, data, response) {
      if (err) {
        log.error('Twitter returned an error');
        log.error(response);
      }
      else {
        tw_id = data.id;
        log.debug('Looked up Twitter screen name: ' + tw_user);
        log.debug('Got ID: ' + tw_id);
      };
    });
  }
}
listen.go()
