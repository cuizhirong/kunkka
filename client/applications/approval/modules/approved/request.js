const storage = require('client/applications/approval/cores/storage');
const fetch = require('../../cores/fetch');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/api/apply/approved?limit=' + pageLimit + '&&page=1';
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
    let url = '/api/apply/' + nextUrl;
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
    let url = '/api/apply/' + applicationID + '?status=approved';
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
  getResourceInfo: function(forced) {
    let resources = ['image', 'flavor', 'securitygroup', 'subnet', 'loadbalancer',
    'listener', 'pool', 'floatingip', 'volume', 'instance', 'network'];
    return storage.getList(resources, forced).then(function(data) {
      return data;
    });
  }
};
