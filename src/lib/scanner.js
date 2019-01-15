import EventEmitter from 'events'
import noble from 'noble'
import logger from "./log";
import arping from 'arping'
import ping from 'net-ping'

export default class Scanner extends EventEmitter {

    constructor(interval, device, bles, ips, ownIp) {
        super();

        this.interval = interval * 1000
        this.device = device;
        this.bles = bles
        this.ips = ips
        this.subnet = ownIp.split('.').slice(0,3).join('.');

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
                if (this._isSameSubnet(ip)) {
                    logger.debug(`arping ${ip}`)
                    this._arping(ip);
                } else {
                    logger.debug(`pinging ${ip}`)
                    this._pingHost(ip);
                }
            }
        }, this.interval)
    }

    _arping(ip) {
        arping.ping(ip, { tries: 10 }, (err, info) => {
            if (err) {
                logger.debug(`Can't find ${ip}, ${err}`);
            } else {
                logger.debug(`found ${info.sip}, mac: ${info.sha}`);
                this.emit('discover', 'ip', ip)
            }
        });
    }

    _pingHost(ip) {
        const session = ping.createSession ();
        session.pingHost(ip, (err) => {
            if (!err) {
                this.emit('discover', 'ip', ip)
            } else {
                logger.debug(`Can't find ${ip}, ${err}`);
            }
            session.close();
        })
    }

    _isSameSubnet(ip) {
        return this.subnet === ip.substr(0, this.subnet.length)
    }
}
