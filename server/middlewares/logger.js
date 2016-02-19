var winston = require('winston');
var config = require('config');
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'accessLog',
      filename: config('log').accessLogPath,
      level: 'info',
      json: false,
      timestamp: false,
      showLevel: false
    }),
    new (winston.transports.File)({
      name: 'errorLog',
      filename: config('log').errorLogPath,
      level: 'error',
      json: false,
      timestamp: true
    })
  ]
});

exports.accessLogger = {
  write: function (message, encoding) {
    logger.info(message);
  }
};

exports.errorLogger = function(err, req, res, next) {
  logger.error(req.ip + ' ' + req.method + ' ' + req.url + ' ' + err.stack);
  next(err);
};

exports.logger = logger;
