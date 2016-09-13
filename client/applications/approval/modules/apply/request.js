var storage = require('client/applications/approval/cores/storage');
var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/api/apply/my-apply?limit=' + pageLimit + '&&page=1';
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
  modifyApply: function(item, newDesc) {
    var data = {};
    data.description = newDesc;
    data.detail = item.detail;
    return fetch.put({
      url: '/api/apply/' + item.id,
      data: data
    });
  },
  deleteApply: function(items) {
    var deferredList = [];
    items.forEach(item => {
      deferredList.push(fetch.delete({
        url: '/api/apply/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  getResourceInfo: function(forced) {
    var resources = ['image', 'flavor', 'securitygroup', 'subnet', 'loadbalancer',
    'listener', 'pool', 'floatingip', 'volume', 'instance', 'network'];
    return storage.getList(resources, forced).then(function(data) {
      return data;
    });
  }
};
