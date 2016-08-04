var fetch = require('../../cores/fetch');

module.exports = {
  getList: function(id) {
    var url = '/proxy/gringotts/v2/accounts/' + id;
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
    var url = '/api/pay/' + method;
    return fetch.post({
      url: url,
      data: data
    });
  }
};
