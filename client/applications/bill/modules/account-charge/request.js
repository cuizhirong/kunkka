const fetch = require('../../cores/fetch');

module.exports = {
  getList: function(id) {
    let url = '/proxy/gringotts/v2/accounts/' + id;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    }).catch((res) => {
      res._url = url;
      return res;
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
