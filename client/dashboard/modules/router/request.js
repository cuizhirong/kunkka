var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['router'], forced).then(function(data) {
      cb(data.router);
    });
  },
  editRouterName: function(item, newName) {
    var data = {};
    data.router = {};
    data.router.name = newName;

    return request.put({
      url: '/proxy/neutron/v2.0/routers/' + item.id,
      data: data
    });
  }
};
