var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['securitygroup'], forced).then(function(data) {
      return data.securitygroup;
    });
  },
  deleteSecurityGroup: function(items) {
    var deferredList = [];
    items.forEach((ele) => {
      deferredList.push(fetch.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-security-groups/' + ele.id
      }));
    });
    return RSVP.all(deferredList);
  },
  editSecurityGroup: function(item, newData) {
    let data = {};
    data.security_group = {};
    data.security_group = newData;

    return fetch.put({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-security-groups/' + item.id,
      data: data
    });
  },
  addSecurityGroup: function(items) {
    let data = {};
    data.security_group = items;

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-security-groups',
      data: data
    });
  },
  addSecurityGroupRule: function(newData) {
    var data = {};
    data.security_group_rule = newData;

    return fetch.post({
      url: '/proxy/neutron/v2.0/security-group-rules',
      data: data
    });
  },
  deleteRules: function(item) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-security-group-rules/' + item.id
    });
  }
};
