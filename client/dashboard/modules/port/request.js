var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');
var RSVP = require('rsvp');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['port'], forced).then(function(data) {
      cb(data.port);
    });
  },
  editPortName: function(item, newName) {
    var data = {};
    data.port = {};
    data.port.name = {};

    return request.put({
      url: '/proxy/neutron/v2.0/ports/' + item.id,
      data: data
    });
  },
  deletePorts: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(request.delete({
        url: '/proxy/neutron/v2.0/ports/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  }
};
