const chai = require('chai');
import Scanner from '../src/lib/scanner'

chai.should();
let scanner;

describe('Scanner', () => {
    beforeEach(() => {
        scanner = new Scanner(1000, 'eth0', [], [], '192.168.178.1')
    })

    describe('#subnet', () => {
        it('returns the right subnet', () => {
            scanner.subnet.should.equal('192.168.178')
        })

        it('detects if a given ip is in the same subnet', () => {
            scanner._isSameSubnet('192.168.178.55').should.equal(true);
            scanner._isSameSubnet('192.168.99.27').should.equal(false);
        })
    })
})