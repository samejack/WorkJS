'use strict';

var winston = require('winston');
var fs = require('fs');

winston.emitErrs = true;

var logger = function (logPath) {
  if (typeof(logPath) === 'undefined') {
    logPath = __dirname + '/../../logs';
  }

  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
  }

  var loggerObject = new winston.Logger({
    transports: [
      new winston.transports.File({
        level: 'info',
        filename: logPath + '/all-logs.log',
        handleExceptions: true,
        json: false,
        maxsize: 5242880, //5MB
        maxFiles: 10,
        colorize: false,
        timestamp: function() {
          return (new Date()).toISOString();
        },
        formatter: function(options) {
          return options.timestamp() + ' [' + options.level.toUpperCase() + '] ' +
            (options.message ? options.message : '') +
            (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
        }
      }),
      new winston.transports.DailyRotateFile({
        name: 'mainlog',
        level: 'info',
        handleExceptions: true,
        humanReadableUnhandledException: true,
        filename: logPath + '/exception.log',
        json: false,
        maxsize: 5242880, //5MB
        maxFiles: 10,
        datePattern: '.yyyy-MM-dd.log',
        timestamp: function() {
          return (new Date()).toISOString();
        },
        formatter: function(options) {
          return options.timestamp() + ' [' + options.level.toUpperCase() + '] ' +
            (options.message ? options.message : '') +
            (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
        }
      }),
      new winston.transports.Console({
        level: 'debug',
        humanReadableUnhandledException: true,
        handleExceptions: true,
        json: false,
        colorize: true,
        timestamp: function() {
          return (new Date()).toISOString();
        },
        formatter: function(options) {
          return options.timestamp() + ' [' + options.level.toUpperCase() + '] ' +
            (options.message ? options.message : '') +
            (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
        }
      })
    ],
    exitOnError: false
  });

  loggerObject.debug('logPath set to: ' + logPath);

  return loggerObject;
};

module.exports = logger;
module.exports.stream = {
  write: function (message) {
    logger.info(message);
  }
};