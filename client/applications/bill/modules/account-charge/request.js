const fetch = require('../../cores/fetch');

module.exports = {
  getList: function() {
    let url = '/proxy/shadowfiend/v1/accounts/' + HALO.user.userId;
    return fetch.get({
      url: url
    });
  },
  payment: function(method, data) {
    let url = '/api/pay/' + method;
    return fetch.post({
      url: url,
      data: data
    });
  }
};
