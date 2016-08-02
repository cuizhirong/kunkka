var fetch = require('../../cores/fetch');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/api/ticket/' + HALO.user.userId + '/self-tickets?limit=' + pageLimit + '&page=1';
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
    var url = '/api/ticket/' + HALO.user.userId + '/tickets';
    return fetch.post({
      url: url,
      data: data,
      processData: true
    });
  },
  postFile: function(file) {
    var formData = new FormData();
    formData.append('attachment', file);
    var url = '/api/ticket/' + HALO.user.userId + '/attachments';
    return fetch.post({
      url: url,
      data: formData,
      processData: false,
      contentType: false
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
  updateStatus: function(id, data) {
    var url = '/api/ticket/' + HALO.user.userId + '/tickets/' + id + '/owner';
    return fetch.put({
      url: url,
      data: data
    });
  }
};
