'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _netPing = require('net-ping');

var _netPing2 = _interopRequireDefault(_netPing);

var _noble = require('noble');

var _noble2 = _interopRequireDefault(_noble);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Scanner = function (_EventEmitter) {
    _inherits(Scanner, _EventEmitter);

    function Scanner(interval, uuids, ips) {
        _classCallCheck(this, Scanner);

        var _this = _possibleConstructorReturn(this, (Scanner.__proto__ || Object.getPrototypeOf(Scanner)).call(this));

        _this.interval = interval * 1000;
        _this.uuids = uuids;
        _this.ips = ips;

        _this._ping();
        _this._bleScan();
        _this._arpScan();
        return _this;
    }

    _createClass(Scanner, [{
        key: '_bleScan',
        value: function _bleScan() {
            var _this2 = this;

            _noble2.default.on('discover', function (bleacon) {
                _log2.default.debug('discovered ' + bleacon.id);
                _this2.emit('discover', 'uuid', bleacon.id);
            });

            setInterval(function () {
                _log2.default.debug('Starting BLE Scan');

                try {
                    _noble2.default.startScanning(_this2.uuids);
                } catch (e) {
                    _log2.default.error(e);
                }

                setTimeout(function () {
                    _log2.default.debug('Stop BLE Scan');
                    _noble2.default.stopScanning();
                }, _this2.interval / 2);
            }, this.interval);
        }
    }, {
        key: '_ping',
        value: function _ping() {
            var _this3 = this;

            _log2.default.debug('creating new ping session');
            var session = _netPing2.default.createSession();

            setInterval(function () {
                var _loop = function _loop(_ip) {
                    _log2.default.debug('pinging ' + _ip);
                    session.pingHost(_ip, function (error) {
                        if (!error) {
                            _log2.default.debug('discovered ' + _ip);
                            _this3.emit('discover', 'ip', _ip);
                        } else {
                            _log2.default.error(error);
                        }
                    });
                };

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = _this3.ips[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _ip = _step.value;

                        _loop(_ip);
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
        key: '_arpScan',
        value: function _arpScan() {
            var _this4 = this;

            // flush only every 10 minutes needed
            setInterval(function () {
                (0, _child_process.execSync)('ip neigh flush dev enxb827eb516e82 ' + ip); //TODO make eth configurable
            }, 1000 * 60 * 10);

            setInterval(function () {
                var _loop2 = function _loop2(_ip2) {
                    _log2.default.debug('arp scan for ' + _ip2);

                    // wake up phone -- sometimes it needs more wakeups
                    for (var $i in 10) {
                        (0, _child_process.execSync)('hping3 -2 -c 10 -p 5353 -i u1 ' + _ip2 + ' -q > /dev/null 2>&1');
                    }

                    setTimeout(function () {
                        var $mac = (0, _child_process.execSync)('arp -an ' + _ip2);
                        if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test($mac)) _this4.emit('discover', 'ip', _ip2);
                    }, 1000);
                };

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = _this4.ips[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _ip2 = _step2.value;

                        _loop2(_ip2);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }, this.interval);
        }
    }]);

    return Scanner;
}(_events2.default);

exports.default = Scanner;