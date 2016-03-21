var request = require('client/libs/ajax');

function errHandler(err) {
  if (err.status === 401) {
    window.location = '/auth/logout';
  }
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
        REGION: 'RegionOne'
      }
    }).catch(errHandler);
  };
});

module.exports = fetch;
