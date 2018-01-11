const fetch = require('client/applications/admin/cores/fetch');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }
    let url = '/api/admin/log/login?limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then(function(res) {
      res._url = 1;
      return res;
    });
  },
  getNextList: function(nextUrl, pageLimit) {
    let url = '/api/admin/log/login?limit=' + pageLimit +
      '&page=' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = nextUrl;
      return res;
    });
  }
};
