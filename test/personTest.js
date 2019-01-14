const chai = require('chai');
import Person from '../src/lib/person'

chai.should();
let person;

describe('Person', () => {

    beforeEach(() => {
        person = new Person({
            name: 'Username',
            ble: '00:09:8C:00:69:63',
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

    describe('#ble', () => {
        it('returns the ble mac address', () => {
            person.ble.should.equal('00:09:8C:00:69:63')
        })

        it('can be null', () => {
            (() => {
                person.ble = null
            }).should.not.throw(Error);
        })

        it('returns only accepts valid mac addresses', () => {
            (() => {
                person.ble = '1340c:8C:00:69:63'
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
