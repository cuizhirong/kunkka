var storage = require('client/dashboard/cores/storage');
var fetch = require('client/dashboard/cores/fetch');

module.exports = {
  getList: function(forced) {
    return storage.getList(['instance'], forced).then(function(data) {
      return data.instance;
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
  getVolumeList: function() {
    return storage.getList(['volume']).then(function(data) {
      return data.volume;
    });
  },
  getSubnetList: function() {
    return storage.getList(['subnet']).then(function(data) {
      return data.subnet;
    });
  },
  getPortList: function() {
    return storage.getList(['port']).then(function(data) {
      return data.port;
    });
  }
};
