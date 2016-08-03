var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['instance', 'image', 'network', 'subnet', 'keypair', 'flavor', 'port', 'floatingip', 'securitygroup', 'volume'], forced).then(function(data) {
      return data.instance;
    });
  },
  getPrices: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/products'
    });
  },
  deleteItem: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  getSecuritygroupList: function() {
    return storage.getList(['securitygroup']).then((data) => {
      return data.securitygroup;
    });
  },
  getFloatingIpList: function() {
    return storage.getList(['floatingip']).then(function(data) {
      return data.floatingip;
    });
  },
  poweron: function(items) {
    var data = {};
    data['os-start'] = null;

    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.post({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
        data: data
      }));
    });
    return RSVP.all(deferredList);
  },
  poweroff: function(items) {
    var data = {};
    data['os-stop'] = null;

    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.post({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
        data: data
      }));
    });
    return RSVP.all(deferredList);
  },
  reboot: function(items) {
    var data = {};
    data.reboot = {};
    data.reboot.type = 'SOFT';

    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.post({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
        data: data
      }));
    });
    return RSVP.all(deferredList);
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
  getVncConsole: function(item) {
    var data = {
      'os-getVNCConsole': {
        'type': 'novnc'
      }
    };

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
      data: data
    });
  },
  getVolumeList: function(fetchVolumeTypes) {
    var deferredList = [];
    deferredList.push(storage.getList(['volume']));
    if (fetchVolumeTypes) {
      deferredList.push(fetch.get({
        url: '/proxy/cinder/v2/' + HALO.user.projectId + '/types'
      }));
    }
    return RSVP.all(deferredList);
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
  },
  deleteSnapshot: function(item) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/images/' + item.id
    });
  },
  createSnapshot: function(snapshot, item) {
    var data = {};
    data.createImage = snapshot;
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
      data: data
    });
  },
  attachVolume: function(item, volumeId) {
    var data = {};
    data.volumeAttachment = {
      volumeId: volumeId
    };

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/os-volume_attachments',
      data: data
    });
  },
  detachVolume: function(item) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.rawItem.id + '/os-volume_attachments/' + item.childItem.id
    });
  },
  joinNetwork: function(item, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/os-interface',
      data: {
        interfaceAttachment: data
      }
    });
  },
  createPort: function(port) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/ports',
      data: {
        port: port
      }
    });
  },
  detachNetwork: function(item) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.rawItem.id + '/os-interface/' + item.childItem.port.id
    });
  },
  getData: function() {
    return storage.getList(['flavor', 'image', 'securitygroup', 'network', 'keypair']).then(function(data) {
      return data;
    });
  },
  getFlavors: function() {
    return storage.getList(['flavor']).then(function(data) {
      return data.flavor;
    });
  },
  createInstance: function(data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers',
      data: {
        server: data
      }
    }).then(function(res) {
      return res.server;
    });
  },
  resizeInstance: function(serverId, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/action',
      data: data
    });
  },
  associateFloatingIp: function(serverId, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/action',
      data: data
    });
  },
  dissociateFloatingIp: function(serverId, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/action',
      data: data
    });
  },
  detachSomeVolume: function(serverId, items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/os-volume_attachments/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  updateSecurity: function(portId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/ports/' + portId,
      data: data
    });
  }
};
