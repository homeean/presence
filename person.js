const ping = require ('net-ping')
const session = ping.createSession();
const Bleacon = require('bleacon')
const EventEmitter = require('events')
const debug = require('debug')('homeean-presence')

class Person extends EventEmitter {

    constructor(config) {
        super();
        this.name = config.name;
        this.uuid = config.uuid || null;
        this.ip = config.ip || null;
        this.last_seen = 0;
        this.last_device = null;
        this.timelock = 0;
        this.last_state = false;
        this.current_state = false;

        debug('%s registered as person', this.name);
    }

    /**
     * [name description]
     * @return {string} [description]
     */
    get name() {
        return this._name;
    }

    /**
     * [name description]
     * @param  {string} value [description]
     * @return {void}       [description]
     */
    set name(value) {
        if (typeof value !== 'string') {
            throw new Error('"name" must be a string')
        }

        this._name = value;
    }

    /**
     * [uuid description]
     * @return {string} [description]
     */
    get uuid() {
        return this._uuid;
    }

    /**
     * [uuid description]
     * @param  {string} value [description]
     * @return {void}       [description]
     */
    set uuid(value) {
        const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

        if(!pattern.test(value) && value !== null) {
            throw new Error('"uuid" must be an valid uuid (v4)')
        }

        this._uuid = value;
    }

    /**
     *
     * @returns {*}
     */
    getState() {
        return this._current_state;
    }

    /**
     *
     * @param {Boolean} value
     * @return {void}
     */
    setState(value) {
        if (typeof value !== 'boolean') {
            throw new Error('"state" must be of type boolean')
        }

        this._current_state = value;

        if (value !== this.last_state) {
            this.emit('stateChanged', this.name, value)
            this.last_state = value;
        }
    }


    setStateFor(value, duration) {
        this.setState(value);
        this.timelock = Date.now() + duration * 1000;
    }

    /**
     * [last_seen description]
     * @return {Number} [description]
     */
    get last_seen() {
        return this._last_seen
    }

    /**
     * [last_seen description]
     * @param  {Number} value [description]
     * @return {void}       [description]
     */
    set last_seen(value) {
        if (typeof value !== 'number') {
            throw new Error('"last_seen" must be a number (unix time)')
        }

        this._last_seen = value
    }



    /**
     * [ip description]
     * @return {string} [description]
     */
    get ip() {
        return this._ip
    }

    /**
     * [ip description]
     * @param  {string} value [description]
     * @return {void}       [description]
     */
    set ip(value) {
        const pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!pattern.test(value) && value !== null) {
            throw new Error('"ip" must be a valid ip-adress')
        }

        this._ip = value;
    }

    /**
     * start tracking of person
     * @param  {Number} [interval=20] check interval in seconds
     * @param  {Number} [treshold=180] threshold before state change in seconds
     * @return {void}
     */
    track(interval = 20, threshold = 180) {
        debug('start tracking for %s', this.name)
        this.interval = interval * 1000;
        this.threshold = threshold * 1000;

        if (this.ip) this._ping();
        if (this.uuid) this._bleScan();

        setInterval(() => {
            if (this.timelock > Date.now()) {
                debug('timelock is active, no state updates until %s', new Date(this.timelock).toISOString());
                return;
            }

            debug('%s last_seen: %s [%s]',
                this.name, this.last_seen ? new Date(this.last_seen).toISOString() : 'never', this.last_device);
            this.setState(Date.now() < this.last_seen + this.threshold);
        }, this.interval);
    }

    /**
     * [_ping description]
     * @param  {[type]} ip [description]
     * @return {[type]}    [description]
     */
    _ping() {
        setInterval(() => {
            session.pingHost (this.ip, (error) => {
                if (!error) {
                    this.last_seen = Date.now();
                    this.last_device = 'ip'
                }
            });
        }, this.interval)
    }

    /**
     * [_bleScan description]
     * @return {[type]} [description]
     */
    _bleScan() {
        setInterval(() => {
            // debug('Start BLE Scan for %s.', this.name);
            Bleacon.startScanning(this.uuid.replace(/-/g, '').toLowerCase());

            setTimeout(() => {
            // debug('Stop BLE Scan for %s.', this.name);
                Bleacon.stopScanning();
            }, this.interval / 2);

        }, this.interval)

        Bleacon.on('discover', (bleacon) => {
            if (bleacon.uuid === this.uuid.replace(/-/g, '').toLowerCase()) {
                // debug('discovered device %s.', bleacon.uuid);
                this.last_seen = Date.now();
                this.last_device = 'bleacon'
            }
        });
    }

    /**
     * [_nmap description]
     * @return {[type]} [description]
     */
    _nmap() {
        // TODO:
    }
}

module.exports = Person;
