'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _logplease = require('logplease');

var _logplease2 = _interopRequireDefault(_logplease);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _logplease2.default.create('homeean-presence', {
    filename: 'homeean-presence.log',
    appendFile: false
});