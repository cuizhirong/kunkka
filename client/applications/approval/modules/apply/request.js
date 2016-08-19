var storage = require('client/applications/approval/cores/storage');
var fetch = require('client/applications/approval/cores/fetch');

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
  }
};
