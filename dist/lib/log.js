'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _winston = require('winston');

exports.default = (0, _winston.createLogger)({
    format: _winston.format.combine(_winston.format.timestamp(), _winston.format.simple()),
    transports: [new _winston.transports.Console(), new _winston.transports.File({ filename: 'homeean-presence.log' })]
});