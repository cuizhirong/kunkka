var ajax = require('client/libs/ajax');

module.exports = {
  getVerification: function(phone) {
    return ajax.post({
      url: '/api/register/phone',
      contentType: 'application/json',
      data:{
        phone: phone
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
  }
};
