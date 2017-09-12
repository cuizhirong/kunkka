'use strict';

const config = require('config');

const sessionEnginePort = config('sessionEngine').port;
const sessionEngineType = config('sessionEngine').type;

module.exports = function (err, req, res, next) {
  if (err.status && err.response) {
    res.status(err.status).json(err.response.body);
  } else {
    if ((err.code && err.code === 'ECONNREFUSED' && err.port && err.port === sessionEnginePort) || (sessionEnginePort && err.message.indexOf(sessionEnginePort) > -1)) {
      err.message = sessionEngineType + ' out of service';
    }
    res.status(500).json({error: err.message || err});
  }
};
