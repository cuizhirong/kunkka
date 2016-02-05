var request = require('client/libs/ajax');

module.exports = {
  get: function(options) {
    return request.get({
      url: options.url,
      dataType: options.dataType || 'json',
      headers: {
        REGION: 'RegionOne'
      }
    });
  },
  post: function(options) {
    return request.post({
      url: options.url,
      dataType: options.dataType || 'json',
      data: options.data,
      headers: {
        REGION: 'RegionOne'
      }
    });
  }
};
