var storage = require('client/applications/approval/cores/storage');
var fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getList: function(forced) {
    return storage.getList(['Approving'], forced).then(function(data) {
      return data.Approving;
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
  }
};
