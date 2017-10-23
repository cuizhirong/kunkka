const fetch = require('../../cores/fetch');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1&deleted=True&status=soft_deleted&limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getSingle: function(serverID) {
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    let url = '/proxy/nova/v2.1/' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  restore: function(id) {
    let data = {
      'restore': null
    };
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + id + '/action',
      data: data
    });
  },
  forceDelete: function(id) {
    let data = {
      'forceDelete': null
    };
    return fetch.post({
      url: '/proxy/nova/v2/' + HALO.user.projectId + '/servers/' + id + '/action',
      data: data
    });
  }
};
