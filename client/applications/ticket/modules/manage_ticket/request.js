var fetch = require('../../cores/fetch');

module.exports = {
  getList: function(status, pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/api/ticket/' + HALO.user.userId + '/tickets?limit=' + pageLimit + '&status=' + status + '&page=1';
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
  getSingle: function(id, status) {
    var url = '/api/ticket/' + HALO.user.userId + '/tickets/' + id + '?status=' + status;
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
  updateStatus: function(id, data) {
    var url = '/api/ticket/' + HALO.user.userId + '/tickets/' + id + '/handler';
    return fetch.put({
      url: url,
      data: data
    });
  },
  addFile: function(ticketId, data) {
    var url = '/api/ticket/' + HALO.user.userId + '/tickets/' + ticketId + '/attachments';

    return fetch.post({
      url: url,
      data: data
    });
  },
  downloadFile: function(name) {
    var url = '/api/ticket/' + HALO.user.userId + '/attachments/' + name;

    return fetch.get({
      url: url
    });
  },
  createReply: function(id, data) {
    var url = '/api/ticket/' + HALO.user.userId + '/ticket/' + id + '/reply';
    return fetch.post({
      url: url,
      data: data
    });
  },
  filter: function(start, pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/api/ticket/' + HALO.user.userId + '/tickets?limit=' + pageLimit + '&start=' + start + '&page=1';
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
  passedToAdmin: function(id) {
    var url = '/api/ticket/' + HALO.user.userId + '/tickets/' + id + '/higher';
    return fetch.put({
      url: url
    });
  }
};
