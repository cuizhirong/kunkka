var storage = require('client/applications/approval/cores/storage');
var fetch = require('../../cores/fetch');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/api/apply/approving?limit=' + pageLimit + '&&page=1';
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
    var url = '/api/apply/' + nextUrl;
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
  getApplicationByID: function(applicationID) {
    var url = '/api/apply/' + applicationID;
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
  acceptApply: function(item) {
    return fetch.put({
      url: '/api/apply/' + item.id + '/approve',
      data: {status: 'pass'}
    });
  },
  refuseApply: function(item, text) {
    return fetch.put({
      url: '/api/apply/' + item.id + '/approve',
      data: {
        status: 'refused',
        explain: text
      }
    });
  },
  getResourceInfo: function(forced) {
    var resources = ['image', 'flavor', 'securitygroup', 'subnet', 'loadbalancer',
    'listener', 'pool', 'floatingip', 'volume', 'instance', 'network'];
    return storage.getList(resources, forced).then(function(data) {
      return data;
    });
  }
};
