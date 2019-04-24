import logger from './log';
import EventEmitter from 'events';

export default class Person extends EventEmitter {
    constructor(config) {
        super();
        this.name = config.name;
        this.ble = config.ble || null;
        this.ip = config.ip || null;
        this.webhooks = config.webhooks || null;

        this.last_seen = 0;
        this.last_device = 'unknown';
        this.timelock = 0;
        this.last_state = false;
        this.current_state = false;

        logger.info(`${this.name} registered as person`);
    }

    /**
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     *
     * @param value
     */
    set name(value) {
        if (typeof value !== 'string') {
            throw new Error('"name" must be a string');
        }

        this._name = value;
    }

    /**
     *
     * @returns {string}
     */
    get ble() {
        return this._ble;
    }

    /**
     *
     * @param value
     */
    set ble(value) {
        const pattern = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i;

        if (!pattern.test(value) && value !== null) {
            throw new Error('"ble" must be an valid mac address');
        }

        this._ble = value;
    }

    /**
     *
     * @returns {boolean}
     */
    getState() {
        return this.current_state;
    }

    /**
     *
     * @param value
     * @param duration
     */
    setState(value, duration = null) {
        if (typeof value !== 'boolean') {
            throw new Error('"state" must be of type boolean');
        }

        this.current_state = value;
        if (duration) {
            this.timelock = Date.now() + duration * 1000;
            logger.debug(
                `timelock for ${duration}s until ${new Date(this.timelock).toLocaleString()}`
            );
            new Date(this.timelock).toLocaleString();
        }

        if (value !== this.last_state) {
            this.emit('stateChanged', this, value);
            this.last_state = value;
        }
    }

    /**
     *
     * @returns {Number|number}
     */
    get last_seen() {
        return this._last_seen;
    }

    /**
     *
     * @param value
     */
    set last_seen(value) {
        if (typeof value !== 'number') {
            throw new Error('"last_seen" must be a number (unix time)');
        }

        this._last_seen = value;
    }

    /**
     *
     * @returns {String}
     */
    get ip() {
        return this._ip;
    }

    /**
     *
     * @param value
     */
    set ip(value) {
        const pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!pattern.test(value) && value !== null) {
            throw new Error('"ip" must be a valid ip-adress');
        }

        this._ip = value;
    }

    /**
     * start tracking of person
     * @param  {Number} [interval=20] check interval in seconds
     * @param  {Number} [threshold=240] threshold before state change in seconds
     * @return {void}
     */
    track(interval = 20, threshold = 300) {
        setInterval(() => {
            if (this.timelock > Date.now()) {
                logger.warn(
                    `${this.name}: timelock is active, no state updates until ${new Date(
                        this.timelock
                    ).toLocaleString()}`
                );
                return;
            }

            logger.debug(
                `${this.name}: last_seen: ${
                    this.last_seen ? new Date(this.last_seen).toLocaleString() : 'never'
                } [${this.last_device}]`
            );
            this.setState(Date.now() < this.last_seen + threshold * 1000);
        }, interval * 1000);
    }
}
