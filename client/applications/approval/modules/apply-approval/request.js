const storage = require('client/applications/approval/cores/storage');
const fetch = require('../../cores/fetch');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/api/apply/approving?limit=' + pageLimit + '&&page=1';
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
    let url = '/api/apply/' + applicationID + '?status=approving';
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
    let resources = ['image', 'flavor', 'securitygroup', 'subnet', 'loadbalancer',
    'listener', 'pool', 'floatingip', 'volume', 'instance', 'network'];
    return storage.getList(resources, forced).then(function(data) {
      return data;
    });
  }
};
