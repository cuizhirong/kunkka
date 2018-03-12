const fetch = require('client/applications/admin/cores/fetch');

module.exports = {
  getList: function() {
    const url = '/api/video/account';
    return fetch.get({
      url: url
    }).then(function(res) {
      res._url = url;
      return res;
    });
  },
  getUsers: function() {
    return fetch.get({
      url: '/proxy/keystone/v3/users'
    });
  },
  createAccountBinding: function(params) {
    const url = '/api/video/account';
    return fetch.post({
      url: url,
      data: params
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  updateAccountBinding: function(params, mapId) {
    const url = '/api/video/account';
    const data = Object.assign({}, params, {id: mapId});

    return fetch.put({
      url: url,
      data: data
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  deleteAccountBinding: function(mapId) {
    const url = '/api/video/account';
    return fetch.delete({
      url: url,
      data: {
        id: mapId
      }
    }).then((res) => {
      res._url = url;
      return res;
    });
  }
};
