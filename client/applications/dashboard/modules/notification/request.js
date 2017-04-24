var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['notification'], forced).then(function(data) {
      data.notification.forEach(notify => {
        notify.id = notify.uuid;
        notify.created_at = notify.created_at.split('.')[0] + 'Z';
      });
      return data.notification;
    });
  },
  editNotifyName: function(item, newName) {
    var data = {
      name: newName
    };

    var url = '/proxy/kiki/v1/topics/' + item.uuid;
    return fetch.put({
      url: url,
      data: data
    });
  },
  addEndpoint: function(data) {
    var url = '/proxy/kiki/v1/subscriptions';
    return fetch.post({
      url: url,
      data: data
    }).then(res => {
      res.id = res.uuid;
      return res;
    });
  },
  addNotify: function(data) {
    var url = '/proxy/kiki/v1/topics';
    return fetch.post({
      url: url,
      data: data
    });
  },
  deleteItems: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/kiki/v1/topics/' + item.uuid
      }));
    });
    return RSVP.all(deferredList);
  },
  getNotifyById: function(id) {
    var url = '/proxy/kiki/v1/topics/' + id;
    return fetch.get({
      url: url
    });
  },
  resendVerify: function(id) {
    var url = '/proxy/kiki/v1/subscriptions/' + id + '/verify';
    return fetch.put({
      url: url
    });
  },
  updateNotify: function(data, id) {
    var url = '/proxy/kiki/v1/topics/' + id;
    return fetch.put({
      url: url,
      data: data
    });
  },
  deleteSub: function(subId, id) {
    var url = '/proxy/kiki/v1/subscriptions/' + subId + '/' + id;
    return fetch.delete({
      url: url
    });
  }
};
