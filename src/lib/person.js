import logger from './log'
import EventEmitter from 'events'
import request from 'request'

export default class Person extends EventEmitter {

    constructor(config) {
        super();
        this.name = config.name;
        this.uuid = config.uuid || null;
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
        const pattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i

        if(!pattern.test(value) && value !== null) {
            throw new Error('"uuid" must be an valid uuid')
        }

        this._uuid = value ? value.replace(/-/g, '').toLowerCase() : null;
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
     * @param device
     * @param duration
     */
    setState(value, duration = null) {
        if (typeof value !== 'boolean') {
            throw new Error('"state" must be of type boolean')
        }

        this.current_state = value;
        if (duration) {
            this.timelock = Date.now() + duration * 1000;
        }

        if (value !== this.last_state) {
            this.emit('stateChanged', this, value)
            this.last_state = value;
        }
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
     *
     * @returns {String}
     */
    get ip() {
        return this._ip
    }

    /**
     *
     * @param {String} value
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
        this.interval = interval * 1000;
        this.threshold = threshold * 1000;

        setInterval(() => {
            if (this.timelock > Date.now()) {
                logger.warn(`${this.name}: timelock is active, no state updates until ${new Date(this.timelock).toISOString()}`,);
                return;
            }

            logger.info(`${this.name}: last_seen: ${this.last_seen ? new Date(this.last_seen).toISOString() : 'never'} [${this.last_device}]`,);
            this.setState(Date.now() < this.last_seen + this.threshold);
        }, this.interval);
    }
}
