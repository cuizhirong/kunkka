const fetch = require('client/applications/admin/cores/fetch');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }
    let url = '/api/approve-user?status=pass,refused&limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then(function(res) {
      res._url = 1;
      return res;
    });
  },
  getNextList: function(nextUrl, pageLimit) {
    let url = '/api/approve-user?status=pass,refused&limit=' + pageLimit +
      '&page=' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = nextUrl;
      return res;
    });
  },
  getFilterList: function() {
    let url = '/api/approve-user?status=pass,refused';

    return fetch.get({
      url: url
    }).then((res) => {
      res._url = 1;
      return res;
    });
  }
};
