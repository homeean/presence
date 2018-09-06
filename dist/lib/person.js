'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Person = function (_EventEmitter) {
    _inherits(Person, _EventEmitter);

    function Person(config) {
        _classCallCheck(this, Person);

        var _this = _possibleConstructorReturn(this, (Person.__proto__ || Object.getPrototypeOf(Person)).call(this));

        _this.name = config.name;
        _this.uuid = config.uuid || null;
        _this.ip = config.ip || null;
        _this.webhooks = config.webhooks || null;
        _this.last_seen = 0;
        _this.last_device = 'unknown';
        _this.timelock = 0;
        _this.last_state = false;
        _this.current_state = false;

        _log2.default.info(_this.name + ' registered as person');
        return _this;
    }

    /**
     * [name description]
     * @return {string} [description]
     */


    _createClass(Person, [{
        key: 'getState',


        /**
         *
         * @returns {boolean}
         */
        value: function getState() {
            return this.current_state;
        }

        /**
         *
         * @param value
         * @param device
         * @param duration
         */

    }, {
        key: 'setState',
        value: function setState(value) {
            var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (typeof value !== 'boolean') {
                throw new Error('"state" must be of type boolean');
            }

            this.current_state = value;
            if (duration) {
                this.timelock = Date.now() + duration * 1000;
            }

            if (value !== this.last_state) {
                this.emit('stateChanged', this, value);
                this.last_state = value;
            }
        }

        /**
         * [last_seen description]
         * @return {Number} [description]
         */

    }, {
        key: 'track',


        /**
         * start tracking of person
         * @param  {Number} [interval=20] check interval in seconds
         * @param  {Number} [treshold=180] threshold before state change in seconds
         * @return {void}
         */
        value: function track() {
            var _this2 = this;

            var interval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;
            var threshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 180;

            this.interval = interval * 1000;
            this.threshold = threshold * 1000;

            setInterval(function () {
                if (_this2.timelock > Date.now()) {
                    _log2.default.warn(_this2.name + ': timelock is active, no state updates until ' + new Date(_this2.timelock).toISOString());
                    return;
                }

                _log2.default.info(_this2.name + ': last_seen: ' + (_this2.last_seen ? new Date(_this2.last_seen).toISOString() : 'never') + ' [' + _this2.last_device + ']');
                _this2.setState(Date.now() < _this2.last_seen + _this2.threshold);
            }, this.interval);
        }
    }, {
        key: 'name',
        get: function get() {
            return this._name;
        }

        /**
         * [name description]
         * @param  {string} value [description]
         * @return {void}       [description]
         */
        ,
        set: function set(value) {
            if (typeof value !== 'string') {
                throw new Error('"name" must be a string');
            }

            this._name = value;
        }

        /**
         * [uuid description]
         * @return {string} [description]
         */

    }, {
        key: 'uuid',
        get: function get() {
            return this._uuid;
        }

        /**
         * [uuid description]
         * @param  {string} value [description]
         * @return {void}       [description]
         */
        ,
        set: function set(value) {
            var pattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

            if (!pattern.test(value) && value !== null) {
                throw new Error('"uuid" must be an valid uuid');
            }

            this._uuid = value ? value.replace(/-/g, '').toLowerCase() : null;
        }
    }, {
        key: 'last_seen',
        get: function get() {
            return this._last_seen;
        }

        /**
         * [last_seen description]
         * @param  {Number} value [description]
         * @return {void}       [description]
         */
        ,
        set: function set(value) {
            if (typeof value !== 'number') {
                throw new Error('"last_seen" must be a number (unix time)');
            }

            this._last_seen = value;
        }

        /**
         *
         * @returns {String}
         */

    }, {
        key: 'ip',
        get: function get() {
            return this._ip;
        }

        /**
         *
         * @param {String} value
         */
        ,
        set: function set(value) {
            var pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            if (!pattern.test(value) && value !== null) {
                throw new Error('"ip" must be a valid ip-adress');
            }

            this._ip = value;
        }
    }]);

    return Person;
}(_events2.default);

exports.default = Person;