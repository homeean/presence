import EventEmitter from 'events'
import ping from 'net-ping'
import noble from 'noble'
import logger from "./log";
import { execSync } from 'child_process'

export default class Scanner extends EventEmitter {

    constructor(interval, device, uuids, ips) {
        super();

        this.interval = interval * 1000
        this.device = device;
        this.uuids = uuids
        this.ips = ips

        this._ping();
        this._bleScan();
        if (this.device && this.ips.length) this._arpScan();
    }

    _bleScan() {
        noble.on('discover', (bleacon) => {
            logger.debug(`discovered ${bleacon.id}`)
            this.emit('discover', 'uuid', bleacon.id)
        });

        setInterval(() => {
            logger.debug('Starting BLE Scan')

            try {
                noble.startScanning(this.uuids);
            } catch(err) {
                logger.error(`ble scan error: ${err.message}`)
            }

            setTimeout(() => {
                logger.debug('Stop BLE Scan')
                noble.stopScanning();
            }, this.interval / 2);

        }, this.interval)

    }

    _ping() {
        logger.debug('creating new ping session');
        const session = ping.createSession();

        setInterval(() => {
            for (let ip of this.ips) {
                logger.debug(`ping ${ip}`);
                session.pingHost(ip, (err) => {
                    if (!err) {
                        logger.debug(`discovered ${ip} with ping`)
                        this.emit('discover', 'ip', ip);
                    } else {
                        logger.debug(`ping error: ${err.message}`)
                    }
                });
            }
        }, this.interval)
    }

    _arpScan() {

        this.flushArpTable();
        // flush every 10 minutes
        setInterval(() => {this.flushArpTable()}, 1000*60*10);

        setInterval(() => {
            for (let ip of this.ips) {
                logger.debug(`arp scan for ${ip}`);

                // wake up phone -- sometimes it needs more wakeups
                for (let i=0; i<10; i++) {
                    try {
                        execSync(`sudo hping3 -2 -c 10 -p 5353 -i u1 ${ip} -q > /dev/null 2>&1`, {stdio: 'pipe'})
                    } catch (err) {
                        //logger.debug(err.message)
                    }
                }

                setTimeout(() => {
                    try {
                        let mac = execSync(`sudo arp -an ${ip}`, {stdio: 'pipe'})
                        if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac)) {
                            logger.debug(`discovered ${ip} with arp scan`)
                            this.emit('discover', 'ip', ip);
                        }
                    } catch(err) {
                        logger.debug(`arp scan error: ${err.message}`)
                    }
                }, 1000);
            }
        }, this.interval)
    }

    flushArpTable() {
        logger.debug('flushing arp table');
        try {
            for (let ip of this.ips) {
                execSync(`sudo ip neigh flush ${ip}`);
            }
        } catch (err) {
            logger.error(err);
        }
    }
}
