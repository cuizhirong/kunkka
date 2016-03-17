var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');
var RSVP = require('rsvp');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['port', 'instance', 'subnet', 'securitygroup'], forced).then((data) => {
      cb(data.port);
    });
  },
  getSecuritygroupList: function(cb, forced) {
    return storage.getList(['securitygroup'], forced);
  },
  getInstanceList: function(cb, forced) {
    return storage.getList(['instance'], forced);
  },
  getSubnetList: function(cb, forced) {
    return storage.getList(['subnet'], forced);
  },
  editPortName: function(item, newName) {
    var data = {};
    data.port = {};
    data.port.name = newName;

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
  },
  createPort: function(port) {
    var data = {
      port: port
    };
    return request.post({
      url: '/proxy/neutron/v2.0/ports',
      data: data
    });
  },
  editSecurityGroup: function(data, id) {
    return request.put({
      url: '/proxy/neutron/v2.0/ports/' + id,
      data: data
    });
  },
  attachInstance: function(serverId, portId) {
    return request.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/os-interface',
      data: {
        interfaceAttachment: {
          port_id: portId
        }
      }
    });
  },
  detchInstance: function(serverId, portId) {
    return request.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/os-interface/' + portId
    });
  }
};
