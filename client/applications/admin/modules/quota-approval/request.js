const fetch = require('../../cores/fetch');

module.exports = {
  getList: function(pageLimit) {

    let url = '/api/approve-quota?status=pending&limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = 1;
      return res;
    });
  },
  getNextList: function(nextUrl, pageLimit) {
    let url = '/api/approve-quota?status=pending&limit=' + pageLimit +
      '&page=' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = nextUrl;
      return res;
    });
  },
  getSearchList: function() {
    let url = '/api/approve-quota?status=pending';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = 1;
      return res;
    });
  },
  agreeApplication: function(id) {
    let url = '/api/approve-quota/' + id;

    return fetch.put({
      url: url,
      data: {
        status: 'pass'
      }
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  refuseApplication: function(id, msg) {
    let url = '/api/approve-quota/' + id;

    return fetch.put({
      url: url,
      data: {
        status: 'refused',
        message: msg
      }
    }).then((res) => {
      res._url = url;
      return res;
    });
  }
};
