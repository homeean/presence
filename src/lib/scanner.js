import EventEmitter from 'events'
import noble from 'noble'
import logger from "./log";
import arping from 'arping'

export default class Scanner extends EventEmitter {

    constructor(interval, device, bles, ips) {
        super();

        this.interval = interval * 1000
        this.device = device;
        this.bles = bles
        this.ips = ips

        this._ping();
        this._bleScan();
    }

    _bleScan() {
        noble.on('discover', (bleacon) => {
            const mac = bleacon.address.toUpperCase();
            if (this.bles.indexOf(mac) === -1) return;

            logger.debug(`discovered ${mac}`)
            this.emit('discover', 'ble', mac)
        });

        noble.on('scanStart', () => {
            logger.debug(`BLE Scan started`)
        });

        noble.on('scanStop', () => {
            logger.debug('BLE Scan stopped');
        })

        noble.on('warning', (message)  => {
            logger.warn(message);
        })

        setInterval(() => {
            try {
                noble.startScanning();
            } catch(err) {
                logger.error(`ble scan error: ${err.message}`)
            }

            setTimeout(() => {
                noble.stopScanning();
            }, this.interval / 2);

        }, this.interval)

    }

    _ping() {
        setInterval(() => {
            for (let ip of this.ips) {
                logger.debug(`pinging ${ip}`)
                arping.ping(ip, { tries: 10 }, (err, info) => {
                    if (err) {
                        logger.debug(`Can't find ${ip}, ${err}`);
                    } else {
                        logger.debug(`found ${info.sip}, mac: ${info.sha}`);
                        this.emit('discover', 'ip', ip)
                    }
                });
            }
        }, this.interval)
    }
}
