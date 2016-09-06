var storage = require('client/applications/approval/cores/storage');
var fetch = require('client/applications/approval/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['Apply'], forced).then(function(data) {
      return data.Apply;
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
    return storage.getList(['image', 'flavor'], forced).then(function(data) {
      return data;
    });
  }
};
