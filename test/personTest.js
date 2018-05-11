const chai = require('chai');
const Person = require('../person.js');

chai.should();

describe('Person', () => {

    beforeEach(() => {
        person = new Person({
            name: 'Username',
            uuid: '6d412d3b-7ec4-43c4-97ad-0187e70ac9bc',
            ip: '192.168.178.238'
        })
        person.last_seen = 1519129853500
    })

    describe('#name', () => {
        it('returns the name', () => {
            person.name.should.equal('Username')
        })


        it('only accepts string values', () => {
            (() => {
                person.name = 123;
            }).should.throw(Error)
        })
    })

    describe('#uuid', () => {
        it('returns the uuid', () => {
            person.uuid.should.equal('6d412d3b-7ec4-43c4-97ad-0187e70ac9bc')
        })

        it('can be null', () => {
            (() => {
                person.uuid = null
            }).should.not.throw(Error);
        })

        it('returns only accepts valid uuids', () => {
            (() => {
                person.uuid = 'l24872NJN4523468346NFNNF'
            }).should.throw(Error)
        })
    })

    describe('#ip', () => {
        it('returns the ip', () => {
            person.ip.should.equal('192.168.178.238')
        })

        it('can be null', () => {
            (() => {
                person.ip = null
            }).should.not.throw(Error);
        })

        it('only accepts valid ip adresses', () => {
            (() => {
                person.ip = '343.342.532.999'
            }).should.throw(Error);
        })
    })

    describe('#last_seen', () => {
        it('returns the last_seen unix time', () => {
            person.last_seen.should.equal(1519129853500)
        })

        it('only accepts numbers', () => {
            (() => {
                person.ip = '151912985350a'
            }).should.throw(Error);
        })
    })
})
