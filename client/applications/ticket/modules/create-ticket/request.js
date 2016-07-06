var fetch = require('../../cores/fetch');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/api/ticket/' + HALO.user.userId + '/self-tickets';
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
  getSingle: function(id) {
    var url = '/api/ticket/' + HALO.user.userId + '/tickets/' + id;
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
  getNextList: function(nextUrl) {
    var url = nextUrl;
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
  createTickets: function(data) {
    console.log(data);
    var url = '/api/ticket/' + HALO.user.userId + '/tickets';
    return fetch.post({
      url: url,
      data: data
    }).then((res) => {
      return res;
    }).catch((res) => {
      return res;
    });
  }
};
