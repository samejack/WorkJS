'use strict';

var winston = require('winston');
var fs = require('fs');

winston.emitErrs = true;

if (!fs.existsSync(__dirname + '/../../logs')) {
  fs.mkdirSync(__dirname + '/../../logs');
}

var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: __dirname + '/../../logs/all-logs.log',
      handleExceptions: true,
      json: false,
      maxsize: 5242880, //5MB
      maxFiles: 10,
      colorize: false
    }),
    new winston.transports.DailyRotateFile({
      name: 'mainlog',
      level: 'info',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      filename: __dirname + '/../../logs/exception',
      json: false,
      maxsize: 5242880, //5MB
      maxFiles: 10,
      datePattern: '.yyyy-MM-dd.log'
    }),
    new winston.transports.Console({
      level: 'debug',
      humanReadableUnhandledException: true,
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

module.exports = logger;
module.exports.stream = {
  write: function (message) {
    logger.info(message);
  }
};