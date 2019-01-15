'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _noble = require('noble');

var _noble2 = _interopRequireDefault(_noble);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _arping2 = require('arping');

var _arping3 = _interopRequireDefault(_arping2);

var _netPing = require('net-ping');

var _netPing2 = _interopRequireDefault(_netPing);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Scanner = function (_EventEmitter) {
    _inherits(Scanner, _EventEmitter);

    function Scanner(interval, device, bles, ips, ownIp) {
        _classCallCheck(this, Scanner);

        var _this = _possibleConstructorReturn(this, (Scanner.__proto__ || Object.getPrototypeOf(Scanner)).call(this));

        _this.interval = interval * 1000;
        _this.device = device;
        _this.bles = bles;
        _this.ips = ips;
        _this.subnet = ownIp.split('.').slice(0, 3).join('.');

        _this._ping();
        _this._bleScan();
        return _this;
    }

    _createClass(Scanner, [{
        key: '_bleScan',
        value: function _bleScan() {
            var _this2 = this;

            _noble2.default.on('discover', function (bleacon) {
                var mac = bleacon.address.toUpperCase();
                if (_this2.bles.indexOf(mac) === -1) return;

                _log2.default.debug('discovered ' + mac);
                _this2.emit('discover', 'ble', mac);
            });

            _noble2.default.on('scanStart', function () {
                _log2.default.debug('BLE Scan started');
            });

            _noble2.default.on('scanStop', function () {
                _log2.default.debug('BLE Scan stopped');
            });

            _noble2.default.on('warning', function (message) {
                _log2.default.warn(message);
            });

            setInterval(function () {
                try {
                    _noble2.default.startScanning();
                } catch (err) {
                    _log2.default.error('ble scan error: ' + err.message);
                }

                setTimeout(function () {
                    _noble2.default.stopScanning();
                }, _this2.interval / 2);
            }, this.interval);
        }
    }, {
        key: '_ping',
        value: function _ping() {
            var _this3 = this;

            setInterval(function () {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = _this3.ips[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var ip = _step.value;

                        if (_this3._isSameSubnet(ip)) {
                            _log2.default.debug('arping ' + ip);
                            _this3._arping(ip);
                        } else {
                            _log2.default.debug('pinging ' + ip);
                            _this3._pingHost(ip);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }, this.interval);
        }
    }, {
        key: '_arping',
        value: function _arping(ip) {
            var _this4 = this;

            _arping3.default.ping(ip, { tries: 10 }, function (err, info) {
                if (err) {
                    _log2.default.debug('Can\'t find ' + ip + ', ' + err);
                } else {
                    _log2.default.debug('found ' + info.sip + ', mac: ' + info.sha);
                    _this4.emit('discover', 'ip', ip);
                }
            });
        }
    }, {
        key: '_pingHost',
        value: function _pingHost(ip) {
            var _this5 = this;

            var session = _netPing2.default.createSession();
            session.pingHost(ip, function (err) {
                if (!err) {
                    _this5.emit('discover', 'ip', ip);
                } else {
                    _log2.default.debug('Can\'t find ' + ip + ', ' + err);
                }
                session.close();
            });
        }
    }, {
        key: '_isSameSubnet',
        value: function _isSameSubnet(ip) {
            return this.subnet === ip.substr(0, this.subnet.length);
        }
    }]);

    return Scanner;
}(_events2.default);

exports.default = Scanner;