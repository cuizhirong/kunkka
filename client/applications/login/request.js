const ajax = require('client/libs/ajax');

module.exports = {
  login: function(data) {
    return ajax.post({
      url: '/auth/login',
      dataType: 'json',
      contentType: 'application/json',
      data: data
    });
  },
  getEncryptionKey: function() {
    const random = Date.now().toString().slice(-6);
    return ajax.get({
      url: '/api/password/uuid?' + random,
      dataType: 'json'
    });
  }
};
