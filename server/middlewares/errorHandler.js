var config = require('config');

var sessionEnginePort = config('sessionEngine').port;
var sessionEngineType = config('sessionEngine').type;

module.exports = function (err, req, res, next) {
  if (err.status) {
    res.status(err.status).json(err.response.body);
  } else {
    if ((err.code && err.code === 'ECONNREFUSED' && err.port && err.port === sessionEnginePort) || err.message.indexOf(sessionEnginePort) > -1) {
      err.message = sessionEngineType + ' out of service';
    }
    res.status(500).json({error: err.message});
  }
};
