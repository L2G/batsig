var expect = require('expect.js');
var repeaterBase = require('../../repeater_base');

describe('repeaterBase', function () {
    var instance = repeaterBase.create();

    describe('.create', function () {
        it('should be defined', function () {
            expect(repeaterBase.create).to.be.a(Function);
        });
    });

    describe('#readyHandler', function () {
        it('should be defined', function () {
            expect(instance.readyHandler).to.be.a(Function);
        });
    });

    describe('#tunedInHandler', function () {
        it('should be defined', function () {
            expect(instance.tunedInHandler).to.be.a(Function);
        });
    });

    describe('#messageHandler', function () {
        it('should be defined', function () {
            expect(instance.messageHandler).to.be.a(Function);
        });
    });

    describe('#errorHandler', function () {
        it('should be defined', function () {
            expect(instance.errorHandler).to.be.a(Function);
        });
    });

    describe('#lostHandler', function () {
        it('should be defined', function () {
            expect(instance.lostHandler).to.be.a(Function);
        });
    });

    describe('#addTuner', function () {
        it('should be defined', function () {
            expect(instance.addTuner).to.be.a(Function);
        });
    });

    describe('#name', function () {
        it('should have a default value "Nameless repeater"', function () {
            expect(instance).to.have.property('name', 'Nameless repeater');
        });
    });
});
