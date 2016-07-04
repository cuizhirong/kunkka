var request = require('client/libs/ajax');
var RSVP = require('rsvp');
var Promise = RSVP.Promise;

function errHandler(err) {
  if (err.status === 401) {
    window.location = '/auth/logout';
  }
  return new Promise(function(resolve, reject) {
    reject(err);
  });
}

var fetch = {};

['get', 'post', 'put', 'delete'].forEach((m) => {
  fetch[m] = function(options) {
    return request[m]({
      url: options.url,
      dataType: options.dataType || 'json',
      data: options.data,
      contentType: 'application/json',
      headers: {
        REGION: HALO.current_region
      }
    }).catch(errHandler);
  };
});

module.exports = fetch;
