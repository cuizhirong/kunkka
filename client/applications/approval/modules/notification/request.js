const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

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
    let data = {
      name: newName
    };

    let url = '/proxy/kiki/v1/topics/' + item.uuid;
    return fetch.put({
      url: url,
      data: data
    });
  },
  addEndpoint: function(data) {
    let url = '/proxy/kiki/v1/subscriptions';
    return fetch.post({
      url: url,
      data: data
    }).then(res => {
      res.id = res.uuid;
      return res;
    });
  },
  addNotify: function(data) {
    let url = '/proxy/kiki/v1/topics';
    return fetch.post({
      url: url,
      data: data
    });
  },
  deleteItems: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/kiki/v1/topics/' + item.uuid
      }));
    });
    return RSVP.all(deferredList);
  },
  getNotifyById: function(id) {
    let url = '/proxy/kiki/v1/topics/' + id;
    return fetch.get({
      url: url
    });
  },
  resendVerify: function(id) {
    let url = '/proxy/kiki/v1/subscriptions/' + id + '/verify';
    return fetch.put({
      url: url
    });
  },
  updateNotify: function(data, id) {
    let url = '/proxy/kiki/v1/topics/' + id;
    return fetch.put({
      url: url,
      data: data
    });
  },
  deleteSub: function(subId, id) {
    let url = '/proxy/kiki/v1/subscriptions/' + subId + '/' + id;
    return fetch.delete({
      url: url
    });
  }
};
