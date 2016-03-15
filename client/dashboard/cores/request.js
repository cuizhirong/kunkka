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
      contentType: 'application/json',
      headers: {
        REGION: 'RegionOne'
      }
    }).catch(errHandler);
  },
  put: function(options) {
    return request.put({
      url: options.url,
      dataType: options.dataType || 'json',
      contentType: 'application/json',
      data: options.data,
      headers: {
        REGION: 'RegionOne'
      }
    }).catch(errHandler);
  },
  delete: function(options) {
    return request.delete({
      url: options.url,
      dataType: options.dataType || 'json',
      contentType: 'application/json',
      data: options.data,
      headers: {
        REGION: 'RegionOne'
      }
    }).catch(errHandler);
  }
};
