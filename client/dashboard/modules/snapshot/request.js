var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['snapshot'], forced).then(function(data) {
      cb(data.snapshot);
    });
  },
  editSnapshotName: function(item, newName) {
    var data = {};
    data.snapshot = {};
    data.snapshot.name = newName;

    return request.put({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots/' + item.id,
      data: data
    });
  }
};
