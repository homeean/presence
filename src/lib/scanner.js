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
            } catch(e) {
                logger.error(e)
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
                logger.debug(`pinging ${ip}`);
                session.pingHost(ip, (error) => {
                    if (!error) {
                        logger.debug(`discovered ${ip}`)
                        this.emit('discover', 'ip', ip);
                    } else {
                        //logger.error(error)
                    }
                });
            }
        }, this.interval)
    }

    _arpScan() {

        // flush only every 10 minutes needed
        setInterval(() => {
            execSync(`ip neigh flush dev ${this.device} ${ip}`);
        }, 1000*60*10);

        setInterval(() => {
            for (let ip of this.ips) {
                logger.debug(`arp scan for ${ip}`);

                // wake up phone -- sometimes it needs more wakeups
                for (let $i in 10) {
                    try {
                        execSync(`hping3 -2 -c 10 -p 5353 -i u1 ${ip} -q > /dev/null 2>&1`, {stdio: 'pipe'})
                    } catch (err) {
                        //logger.error('hping3 command failed')
                    }
                }

                setTimeout(() => {
                    try {
                        let mac = execSync(`arp -an ${ip}`, {stdio: 'pipe'})
                        if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac)) this.emit('discover', 'ip', ip);
                    } catch(err) {
                        //logger.error('arp scan failed')
                    }
                }, 1000);
            }
        }, this.interval)
    }
}
