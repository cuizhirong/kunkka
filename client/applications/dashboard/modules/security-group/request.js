const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['securitygroup'], forced).then(function(data) {
      return data.securitygroup.map((sg) => {
        let rules = sg.security_group_rules.filter((rule) => rule.ethertype !== 'IPv6');
        sg.security_group_rules = rules;

        return sg;
      });
    });
  },
  deleteSecurityGroup: function(items) {
    let deferredList = [];
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
    let data = {};
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
