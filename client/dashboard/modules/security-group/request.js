var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');
var RSVP = require('rsvp');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['securitygroup'], forced).then(function(data) {
      cb(data.securitygroup);
    });
  },
  deleteSecurityGroup: function(items) {
    var deferredList = [];
    items.forEach((ele) => {
      deferredList.push(request.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-security-groups/' + ele.id
      }));
    });
    return RSVP.all(deferredList);
  },
  editSecurityGroup: function(item, newData) {
    let data = {};
    data.security_group = {};
    data.security_group = newData;

    return request.put({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-security-groups/' + item.id,
      data: data
    });
  },
  addSecurityGroup: function(items) {
    let data = {};
    data.security_group = items;

    return request.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-security-groups',
      data: data
    });
  },
  deleteRules: function(item) {
    return request.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-security-group-rules/' + item.id
    });
  }
};
