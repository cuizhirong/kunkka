var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');
var RSVP = require('rsvp');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['keypair'], forced).then(function(data) {
      cb(data.keypair);
    });
  },
  deleteKeypairs: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(request.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-keypairs/' + item.name
      }));
    });
    return RSVP.all(deferredList);
  },
  createKeypair: function(data, cb) {
    return request.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-keypairs',
      data: {
        keypair: data
      }
    }).then(function(res) {
      cb(res.keypair);
    });
  },
  getKeypairByName: function(name) {
    return request.get({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-keypairs/' + name
    });
  }
};
