/* jshint mocha: true */
'use strict';

var expect = require('expect.js');

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
        context('without "twitterID" or "twitterName"', function () {
            it('should throw an error', function () {
                expect(tunerTwitter.create).to.throwError();
            });
        });

        context('with "twitterID"', function () {
            it('should not throw an error (assumes ID is valid)', function () {
                expect(tunerTwitter.create).not.to.throwError();
            });
        });

        context('with "twitterName"', function () {
            it('should not throw an error (assumes name is valid)', function () {
                expect(tunerTwitter.create).not.to.throwError();
            });
        });
    });
});
