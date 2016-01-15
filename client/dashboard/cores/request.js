var request = require('client/libs/request');

module.exports = {
  get: function(options) {
    return request.get({
      url: options.url,
      dataType: options.dataType || 'json',
      headers: {
        REGION: 'RegionOne'
      }
    });
  }
};
