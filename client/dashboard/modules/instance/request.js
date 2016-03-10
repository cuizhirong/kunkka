var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['instance', 'image'], forced).then(function(data) {
      cb(data.instance);
    });
  },
  deleteItem: function(item) {
    return request.delete({
      url: '/api/v1/' + HALO.user.projectId + '/servers/' + item.id + '/action/delete'
    });
  },
  poweroff: function(item) {
    return request.post({
      url: '/api/v1/' + HALO.user.projectId + '/servers/' + item.id + '/action/stop'
    });
  },
  editServerName: function(item, newName) {
    var data = {};
    data.server = {};
    data.server.name = newName;

    return request.put({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id,
      data: data
    });
  }
};
