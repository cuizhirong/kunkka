const storage = require('client/applications/approval/cores/storage');
const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/api/apply/my-apply?limit=' + pageLimit + '&&page=1';
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
    let url = '/api/apply/' + applicationID;
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
  filterFromAll: function(data) {
    let url = '/api/apply/my-apply/?limit=' + data.limit + '&status=' + data.status + '&page=1';
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
  modifyApply: function(item, newDesc) {
    let data = {};
    data.description = newDesc;
    data.detail = item.detail;
    return fetch.put({
      url: '/api/apply/' + item.id,
      data: data
    });
  },
  deleteApply: function(items) {
    let deferredList = [];
    items.forEach(item => {
      deferredList.push(fetch.delete({
        url: '/api/apply/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  getResourceInfo: function(forced) {
    let resources = ['image', 'flavor', 'securitygroup', 'subnet', 'loadbalancer',
    'listener', 'pool', 'floatingip', 'volume', 'instance', 'network'];
    return storage.getList(resources, forced).then(function(data) {
      return data;
    });
  }
};
