'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _logplease = require('logplease');

var _logplease2 = _interopRequireDefault(_logplease);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_logplease2.default.setLogLevel(process.env.LOG_LEVEL || 'INFO');

exports.default = _logplease2.default.create('homeean-presence', {
    filename: _os2.default.homedir() + '/.homeean-presence/homeean-presence.log',
    appendFile: false,
    useLocalTime: true
});