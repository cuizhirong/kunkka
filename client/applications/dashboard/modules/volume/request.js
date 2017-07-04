var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['volume', 'instance', 'snapshot'], forced).then(function(data) {
      data.volume.forEach((v) => {
        v.snapshots = [];
        data.snapshot.forEach((s) => {
          if (s.volume_id === v.id) {
            v.snapshots.push(s);
          }
        });

        if (v.attachments.length > 0) {
          var serverId = v.attachments[0].server_id;
          data.instance.some((ele) => {
            if (ele.id === serverId) {
              v.server = ele;
              return true;
            }
            return false;
          });
          if (!v.server) {
            v.server = {
              id: serverId,
              status: 'SOFT_DELETED'
            };
          }
        }
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
  getVolumePrice: function(type, size) {
    var url = '/proxy/gringotts/v2/products/price' +
      '?purchase.bill_method=hour' +
      '&purchase.purchases[0].product_name=' + type +
      '&purchase.purchases[0].service=block_storage' +
      '&purchase.purchases[0].region_id=' + HALO.current_region +
      '&purchase.purchases[0].quantity=' + size;

    return fetch.get({
      url: url
    });
  },
  getPrices: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/products'
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
  },
  getMeasures: function(ids, granularity, start) {
    var deferredList = [];
    ids.forEach((id) => {
      deferredList.push(fetch.get({
        url: '/proxy/gnocchi/v1/metric/' + id + '/measures?granularity=' + granularity + '&start=' + start
      }));
    });
    return RSVP.all(deferredList);
  },
  getNetworkResourceId: function(id, granularity) {
    let url = '/proxy/gnocchi/v1/search/resource/instance_disk',
      data = {
        '=': {
          original_resource_id: id
        }
      };
    return fetch.post({
      url: url,
      data: data
    });
  },
  getAlarmList: function(id) {
    var alarm = [], rule = '';
    return storage.getList(['alarm']).then(function(data) {
      data.alarm.forEach(a => {
        rule = a.gnocchi_resources_threshold_rule;
        if (rule.resource_type === 'volume' && rule.resource_id === id) {
          a.timestamp = a.timestamp.split('.')[0] + 'Z';
          alarm.push(a);
        }
      });
      return alarm;
    });
  },
  getTransferList: function() {
    return fetch.get({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/os-volume-transfer'
    });
  },
  createTransfer: function(data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/os-volume-transfer',
      data: data
    });
  },
  deleteTransfer: function(transferId) {
    return fetch.delete({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/os-volume-transfer/' + transferId
    });
  },
  acceptTransfer: function(transferId, data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/os-volume-transfer/' + transferId + '/accept',
      data: data
    });
  }
};
