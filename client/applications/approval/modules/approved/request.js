var storage = require('client/applications/approval/cores/storage');
var fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getList: function(forced) {
    return storage.getList(['Approved'], forced).then(function(data) {
      return data.Approved;
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
  getResourceInfo: function(forced) {
    return storage.getList(['image', 'flavor'], forced).then(function(data) {
      return data;
    });
  }
};
