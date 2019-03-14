'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _log = require('./lib/log');

var _log2 = _interopRequireDefault(_log);

var _person = require('./lib/person');

var _person2 = _interopRequireDefault(_person);

var _scanner = require('./lib/scanner');

var _scanner2 = _interopRequireDefault(_scanner);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HomeeanPresence = function (_EventEmitter) {
    _inherits(HomeeanPresence, _EventEmitter);

    function HomeeanPresence(config) {
        _classCallCheck(this, HomeeanPresence);

        var _this = _possibleConstructorReturn(this, (HomeeanPresence.__proto__ || Object.getPrototypeOf(HomeeanPresence)).call(this));

        _this.config = config;
        _this.server = (0, _express2.default)();
        _this.server.use(_bodyParser2.default.json());
        _this.persons = [];
        _this.ipAddress = '127.0.0.1';
        _this.last_state = false;
        return _this;
    }

    _createClass(HomeeanPresence, [{
        key: 'run',
        value: function run() {
            var _this2 = this;

            _log2.default.info('homeean-presence');
            _log2.default.info('2018 by stfnhmplr | homeean.de');
            _log2.default.info('running on node ' + process.version);

            try {
                this.ipAddress = [].concat.apply([], Object.values(_os2.default.networkInterfaces())).filter(function (details) {
                    return details.family === 'IPv4' && !details.internal;
                }).pop().address;
            } catch (e) {
                _log2.default.warn("can't get ip-address, please check your network connection");
            }

            if (typeof this.config !== 'Object') {
                this._loadConfig();
            }

            this._createPersons();
            var bles = this.config.persons.filter(function (p) {
                return p.ble;
            }).map(function (p) {
                return p.ble;
            });
            var ips = this.config.persons.filter(function (p) {
                return p.ip;
            }).map(function (p) {
                return p.ip;
            });
            this.scanner = new _scanner2.default(this.config.interval, this.config.device, bles, ips, this.ipAddress);

            this.scanner.on('discover', function (type, value) {
                var person = _this2._getPersonByDevice(type, value);
                if (person) {
                    person.last_seen = Date.now();
                    person.last_device = type;
                }
            });

            this.server.listen(this.config.port);
        }
    }, {
        key: '_createPersons',
        value: function _createPersons() {
            var _this3 = this;

            this.config.persons.forEach(function (p) {
                var person = new _person2.default(p);

                _log2.default.info('setting up webhook http://' + _this3.ipAddress + ':' + _this3.config.port + '/homeean-presence/' + person.name.toLowerCase());

                _this3.server.post('/homeean-presence/' + person.name.toLowerCase(), function (req, res) {
                    if (typeof req.body.state === 'boolean') {
                        _log2.default.info('received webhook with state "' + req.body.state + '" for ' + person.name);
                        person.last_seen = Date.now();
                        person.last_device = 'Webhook';
                        var timelock = req.body.duration || 30;
                        person.timelock = Date.now() + timelock * 1000;
                        _log2.default.debug('timelock for ' + timelock + 's until ' + new Date(person.timelock).toLocaleString());
                        new Date(_this3.timelock).toLocaleString();
                    } else {
                        _log2.default.warn("Recieved webhook, but can't read state. Please use only values of type Boolean (true/false)");
                    }

                    res.send('received webhook with state "' + req.body.state + '" for ' + person.name);
                });

                person.on('stateChanged', function (person, state) {
                    _log2.default.info(person.name + ' is ' + (state ? 'present' : 'absent') + '.');

                    if (person.webhooks) {
                        _log2.default.info(person.name + ' ' + (state ? 'is' : 'is not') + ' @home, triggering persons webhook for ' + (state ? 'presence' : 'absence'));
                        var webhook = person.webhooks[state ? 'present' : 'absent'];

                        if (!webhook) {
                            _log2.default.warn('please provide an "' + (state ? 'present' : 'absent') + '" webhook url for ' + person.name);
                        } else {
                            _request2.default.get(webhook).on('response', function (res) {
                                _log2.default.debug('received status ' + res.statusCode);
                            }).on('error', function (err) {
                                _log2.default.error('Error triggering webhook: ' + err);
                            });
                        }
                    }
                    _this3._handleStateChange();
                });

                person.track(_this3.config.interval, _this3.config.threshold);
                _this3.persons.push(person);
            });
        }
    }, {
        key: '_getPersonByDevice',
        value: function _getPersonByDevice(type, value) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.persons[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var person = _step.value;

                    if (person[type] === value) return person;
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

            _log2.default.debug('person not found: ' + value + ' [' + type + ']');
        }
    }, {
        key: '_handleStateChange',
        value: function _handleStateChange() {
            var states = this.persons.map(function (p) {
                return p.getState();
            });
            var state = states.some(function (s) {
                return s;
            });

            // if overall state didn't changed
            if (state === this.last_state) return;
            this.last_state = state;

            this.emit('stateChanged', state);

            if ('webhooks' in this.config) {
                _log2.default.info((state ? 'somebody' : 'nobody') + ' @home, triggering webhook for ' + (state ? 'presence' : 'absence'));
                var webhook = this.config.webhooks[state ? 'present' : 'absent'];

                if (!webhook) {
                    _log2.default.warn('please specify an "' + (state ? 'present' : 'absent') + '" webhook in your config file');
                    return;
                }

                _request2.default.get(webhook).on('response', function (res) {
                    _log2.default.debug('received status ' + res.statusCode);
                }).on('error', function (err) {
                    _log2.default.error('Error triggering webhook: ' + err);
                });
            }
        }

        /**
         *
         * @private
         */

    }, {
        key: '_loadConfig',
        value: function _loadConfig() {
            var path = _os2.default.homedir() + '/.homeean-presence/config.json';
            _log2.default.info('load config from ' + path);

            try {
                var file = _fs2.default.readFileSync(path, 'utf8');
                this.config = JSON.parse(file);
            } catch (e) {
                _log2.default.error('Could not find or parse config file');
                process.exit();
            }
        }
    }]);

    return HomeeanPresence;
}(_events2.default);

var homeeanPresence = new HomeeanPresence();
homeeanPresence.run();