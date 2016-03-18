var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');
var RSVP = require('rsvp');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['volume', 'instance'], forced).then(function(data) {
      cb(data.volume);
    });
  },
  getInstances: function(cb) {
    return storage.getList(['instance']).then(function(data) {
      cb(data.instance);
    });
  },
  getOverview: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/overview'
    });
  },
  getVolumeTypes: function() {
    return request.get({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/types'
    });
  },
  createVolume: function(_data) {
    var data = {};
    data.volume = _data;

    return request.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes',
      data: data
    });
  },
  createSnapshot: function(_data) {
    var data = {};
    data.snapshot = _data;

    return request.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots',
      data: data
    });
  },
  attachInstance: function(_data) {
    var data = {};
    data.volumeAttachment = {};
    data.volumeAttachment.volumeId = _data.volumeId;

    return request.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + _data.serverId + '/os-volume_attachments',
      data: data
    });
  },
  detachInstance: function(data) {
    return request.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + data.serverId + '/os-volume_attachments/' + data.attachmentId
    });
  },
  extendVolumeSize: function(item, _data) {
    var data = {};
    data['os-extend'] = _data;

    return request.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id + '/action',
      data: data
    });
  },
  setReadOnly: function(item) {
    var data = {};
    data['os-update_readonly_flag'] = {};
    data['os-update_readonly_flag'].readonly = true;

    return request.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id + '/action',
      data: data
    });
  },
  setReadWrite: function(item) {
    var data = {};
    data['os-update_readonly_flag'] = {};
    data['os-update_readonly_flag'].readonly = false;

    return request.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id + '/action',
      data: data
    });
  },
  editVolumeName: function(item, newName) {
    var data = {};
    data.volume = {};
    data.volume.name = newName;

    return request.put({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id,
      data: data
    });
  },
  deleteVolumes: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(request.delete({
        url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  }
};
