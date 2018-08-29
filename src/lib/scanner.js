import EventEmitter from 'events'
import ping from 'net-ping'
import noble from 'noble'
import logger from "./log";
import { execSync } from 'child_process'

export default class Scanner extends EventEmitter {

    constructor(interval, uuids, ips) {
        super();

        this.interval = interval * 1000
        this.uuids = uuids
        this.ips = ips

        this._ping();
        this._bleScan();
        this._arpScan();
    }

    _bleScan() {
        noble.on('discover', (bleacon) => {
            logger.debug(`discovered ${bleacon.id}`)
            this.emit('discover', 'uuid', bleacon.id)
        });

        setInterval(() => {
            logger.verbose('Starting BLE Scan')

            try {
                noble.startScanning(this.uuids);
            } catch(e) {
                logger.error(e)
            }

            setTimeout(() => {
                logger.verbose('Stop BLE Scan')
                noble.stopScanning();
            }, this.interval / 2);

        }, this.interval)

    }

    _ping() {
        logger.verbose('creating new ping session');
        const session = ping.createSession();

        setInterval(() => {
            for (let ip of this.ips) {
                logger.verbose(`pinging ${ip}`);
                session.pingHost(ip, (error) => {
                    if (!error) {
                        logger.debug(`discovered ${ip}`)
                        this.emit('discover', 'ip', ip);
                    } else {
                        logger.error(error)
                    }
                });
            }
        }, this.interval)
    }

    _arpScan() {

        // flush only every 10 minutes needed
        setInterval(() => {
            execSync(`ip neigh flush dev enxb827eb516e82 ${ip}`); //TODO make eth configurable
        }, 1000*60*10);

        setInterval(() => {
            for (let ip of this.ips) {
                logger.verbose(`arp scan for ${ip}`);

                // wake up phone -- sometimes it needs more wakeups
                for (let $i in 10) {
                    execSync(`hping3 -2 -c 10 -p 5353 -i u1 ${ip} -q > /dev/null 2>&1`)
                }

                setTimeout(() => {
                    let $mac = execSync(`arp -an ${ip}`)
                    if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test($mac)) this.emit('discover', 'ip', ip);
                }, 1000);
            }
        }, this.interval)
    }
}
