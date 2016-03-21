var storage = require('client/dashboard/cores/storage');
var fetch = require('client/dashboard/cores/fetch');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['instance'], forced).then(function(data) {
      cb(data.instance);
    });
  },
  deleteItem: function(item) {
    return fetch.delete({
      url: '/api/v1/' + HALO.user.projectId + '/servers/' + item.id + '/action/delete'
    });
  },
  poweroff: function(item) {
    return fetch.post({
      url: '/api/v1/' + HALO.user.projectId + '/servers/' + item.id + '/action/stop'
    });
  },
  editServerName: function(item, newName) {
    var data = {};
    data.server = {};
    data.server.name = newName;

    return fetch.put({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id,
      data: data
    });
  },
  getVolumeList: function(cb, forced) {
    return storage.getList(['volume'], forced).then(function(data) {
      cb(data.volume);
    });
  },
  getSubnetList: function(cb, forced) {
    return storage.getList(['subnet'], forced).then(function(data) {
      cb(data.subnet);
    });
  },
  getPortList: function(cb, forced) {
    return storage.getList(['port'], forced).then(function(data) {
      cb(data.port);
    });
  }
};
