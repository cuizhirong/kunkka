const request = require('client/libs/ajax');
const RSVP = require('rsvp');
const Promise = RSVP.Promise;

function errHandler(err) {
  if (err.status === 401) {
    window.location = '/auth/logout';
  }
  return new Promise(function(resolve, reject) {
    reject(err);
  });
}

let fetch = {};

['get', 'post', 'put', 'delete'].forEach((m) => {
  fetch[m] = function(options) {
    let opt = Object.assign({
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        REGION: HALO.current_region
      }
    }, options);

    return request[m](opt).catch(errHandler);
  };
});

module.exports = fetch;
