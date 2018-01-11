const ajax = require('client/libs/ajax');

module.exports = {
  getVerification: function(phone, captcha) {
    return ajax.post({
      url: '/api/register/phone',
      contentType: 'application/json',
      data:{
        phone: phone,
        captcha: captcha
      }
    });
  },

  verifyEmail: function(email) {
    return ajax.post({
      url: '/api/register/unique-email',
      contentType: 'application/json',
      data: {
        email: email
      }
    });
  },

  verifyUsername: function(name) {
    return ajax.post({
      url: '/api/register/unique-name',
      contentType: 'application/json',
      data: {
        name: name
      }
    });
  },

  registerAccount: function(data) {
    return ajax.post({
      url: '/api/register',
      contentType: 'application/json',
      data: data
    });
  },

  getEncryptionKey: function() {
    const random = Date.now().toString().slice(-6);
    return ajax.get({
      url: '/api/password/uuid?' + random,
      dataType: 'application/json'
    });
  }
};
