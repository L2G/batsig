/* jshint mocha: true */
'use strict';

var expect = require('expect.js');

var tunerBase = require('../../lib/tuner_base');

describe('tunerBase', function () {
    it('looks like a stampit stamp', function () {
        expect(tunerBase).to.have.property('create');
        expect(tunerBase).to.have.property('fixed');
        expect(tunerBase).to.have.property('methods');
        expect(tunerBase).to.have.property('state');
        expect(tunerBase).to.have.property('enclose');
        expect(tunerBase).to.have.property('compose');
    });

    it('.name default is "Nameless tuner"', function () {
        expect(tunerBase.fixed.state).to.have.property('name', 'Nameless tuner');
    });
});
