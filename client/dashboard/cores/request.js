var request = require('client/libs/ajax');

function errHandler(err) {
  if (err.status === 401) {
    window.location = '/auth/logout';
  }
}

module.exports = {
  get: function(options) {
    return request.get({
      url: options.url,
      dataType: options.dataType || 'json',
      headers: {
        REGION: 'RegionOne'
      }
    }).catch(errHandler);
  },
  post: function(options) {
    return request.post({
      url: options.url,
      dataType: options.dataType || 'json',
      data: options.data,
      headers: {
        REGION: 'RegionOne'
      }
    }).catch(errHandler);
  }
};
