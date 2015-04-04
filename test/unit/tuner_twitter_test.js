/* jshint mocha: true */
'use strict';

var expect = require('expect.js');
var sinon = require('sinon');

// Make a stub to block twit from being called
var Twit = require('twit');

var tunerTwitter = require('../../lib/tuner_twitter');

describe('tunerTwitter', function () {
    it('looks like a stampit stamp', function () {
        expect(tunerTwitter).to.have.property('create');
        expect(tunerTwitter).to.have.property('fixed');
        expect(tunerTwitter).to.have.property('methods');
        expect(tunerTwitter).to.have.property('state');
        expect(tunerTwitter).to.have.property('enclose');
        expect(tunerTwitter).to.have.property('compose');
    });

    it('.name default is "Twitter tuner"', function () {
        expect(tunerTwitter.fixed.state).to.have.property('name', 'Twitter tuner');
    });

    it('.twitterID default is null', function () {
        expect(tunerTwitter.fixed.state).to.have.property('twitterID', null);
    });

    it('.twitterName default is null', function () {
        expect(tunerTwitter.fixed.state).to.have.property('twitterName', null);
    });

    context('.create', function () {
        var testTunerTwitter = tunerTwitter.state({
            _twitFactory: function () {
                return sinon.createStubInstance(Twit);
            }
        });

        context('without "twitterName" or "twitterID"', function () {
            it('should throw an error', function () {
                expect(testTunerTwitter.create).to.throwError();
            });
        });

        context('with "twitterID"', function () {
            it('should not throw an error (assumes ID is valid)', function () {
                expect(testTunerTwitter.create).withArgs({twitterID: 3333333}).
                    not.to.throwError();
            });
        });

        context('with "twitterName"', function () {
            it('should not throw an error (assumes name is valid)', function () {
                expect(testTunerTwitter.create).withArgs({twitterName: 'L2G'}).
                    not.to.throwError();
            });
        });
    });
});
