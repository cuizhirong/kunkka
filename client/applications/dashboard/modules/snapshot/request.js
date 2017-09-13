const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['snapshot'], forced).then(function(data) {
      return data.snapshot;
    });
  },
  editSnapshotName: function(item, newName) {
    let data = {};
    data.snapshot = {};
    data.snapshot.name = newName;

    return fetch.put({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots/' + item.id,
      data: data
    });
  },
  deleteSnapshots: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createBackup: function(data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/backups',
      data: data
    });
  }
};
