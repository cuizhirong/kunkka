const ajax = require('client/libs/ajax');

module.exports = {
  login: function(data) {
    return ajax.post({
      url: '/auth/login',
      dataType: 'json',
      contentType: 'application/json',
      data: data
    });
  }
};
