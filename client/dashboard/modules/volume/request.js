var storage = require('client/dashboard/cores/storage');
var fetch = require('client/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['volume', 'instance', 'snapshot'], forced).then(function(data) {
      data.volume.forEach((m) => {
        m.snapshots = [];
        data.snapshot.forEach((s) => {
          if (s.volume_id === m.id) {
            m.snapshots.push(s);
          }
        });
      });
      return data.volume;
    });
  },
  getInstances: function() {
    return storage.getList(['instance']).then(function(data) {
      return data.instance;
    });
  },
  getOverview: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/overview'
    });
  },
  getVolumeTypes: function() {
    return fetch.get({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/types'
    });
  },
  createVolume: function(_data) {
    var data = {};
    data.volume = _data;

    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes',
      data: data
    });
  },
  createSnapshot: function(_data) {
    var data = {};
    data.snapshot = _data;

    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots',
      data: data
    });
  },
  attachInstance: function(_data) {
    var data = {};
    data.volumeAttachment = {};
    data.volumeAttachment.volumeId = _data.volumeId;

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + _data.serverId + '/os-volume_attachments',
      data: data
    });
  },
  detachInstance: function(data) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + data.serverId + '/os-volume_attachments/' + data.attachmentId
    });
  },
  extendVolumeSize: function(item, _data) {
    var data = {};
    data['os-extend'] = _data;

    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id + '/action',
      data: data
    });
  },
  setReadOnly: function(item) {
    var data = {};
    data['os-update_readonly_flag'] = {};
    data['os-update_readonly_flag'].readonly = true;

    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id + '/action',
      data: data
    });
  },
  setReadWrite: function(item) {
    var data = {};
    data['os-update_readonly_flag'] = {};
    data['os-update_readonly_flag'].readonly = false;

    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id + '/action',
      data: data
    });
  },
  editVolumeName: function(item, newName) {
    var data = {};
    data.volume = {};
    data.volume.name = newName;

    return fetch.put({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id,
      data: data
    });
  },
  deleteVolumes: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  deleteSnapshot: function(item) {
    return fetch.delete({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots/' + item.id
    });
  }
};
