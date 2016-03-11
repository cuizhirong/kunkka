var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['subnet'], forced).then(function(data) {
      cb(data.subnet);
    });
  },
  editSubnetName: function(item, newName) {
    var data = {};
    data.subnet = {};
    data.subnet.name = newName;

    return request.put({
      url: '/proxy/neutron/v2.0/subnets/' + item.id,
      data: data
    });
  }
};
