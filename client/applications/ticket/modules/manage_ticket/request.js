const fetch = require('../../cores/fetch');

module.exports = {
  getList: function(status, pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/api/ticket/' + HALO.user.userId + '/tickets?limit=' + pageLimit + '&status=' + status + '&page=1';
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
    let url = '/api/ticket/' + HALO.user.userId + '/tickets/' + id + '?status=' + status;
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
    let url = nextUrl;
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
    let url = '/api/ticket/' + HALO.user.userId + '/tickets/' + id + '/handler';
    return fetch.put({
      url: url,
      data: data
    });
  },
  addFile: function(ticketId, data) {
    let url = '/api/ticket/' + HALO.user.userId + '/tickets/' + ticketId + '/attachments';

    return fetch.post({
      url: url,
      data: data
    });
  },
  downloadFile: function(name) {
    let url = '/api/ticket/' + HALO.user.userId + '/attachments/' + name;

    return fetch.get({
      url: url
    });
  },
  createReply: function(id, data) {
    let url = '/api/ticket/' + HALO.user.userId + '/ticket/' + id + '/reply';
    return fetch.post({
      url: url,
      data: data
    });
  },
  filter: function(status, start, pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/api/ticket/' + HALO.user.userId + '/tickets?limit=' + pageLimit + '&status=' + status + '&start=' + start + '&page=1';
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
    let url = '/api/ticket/' + HALO.user.userId + '/tickets/' + id + '/higher';
    return fetch.put({
      url: url
    });
  }
};
