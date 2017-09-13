const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['backup', 'volume', 'snapshot'], forced).then(function(data) {
      data.backup.forEach((b) => {
        b.volumes = [];
        b.snapshots = [];
        data.volume.forEach((v) => {

          if(v.id === b.volume_id) {
            b.volumes.push(v);
          }
        });
        data.snapshot.forEach((s) => {
          if(s.id === b.snapshot_id) {
            b.snapshots.push(s);
          }
        });
      });
      return data.backup;
    });
  },
  getBackupDetail: function(item) {
    return fetch.get({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/backups' + item.id
    });
  },
  deleteBackup: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/cinder/v3/' + HALO.user.projectId + '/backups/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  editBackupName: function(item, newName) {
    let data = {};
    data.name = newName;
    return fetch.put({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/backups/' + item.id,
      data: data
    });
  },
  getProjectBackup: function(forceUpdate) {
    return fetch.get({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/backups'
    });
  },
  restoreBackup: function(item, data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/backups/' + item.id + '/restore',
      data: data
    });
  }
};
