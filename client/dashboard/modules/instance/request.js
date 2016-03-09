var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['instance', 'image'], forced).then(function(data) {
      cb(data.instance);
    });
  },
  deleteItem: function(rows, cb) {
    rows.forEach((item) => {
      request.delete({
        url: '/api/v1/' + HALO.user.projectId + '/servers/' + item.id + '/action/delete'
      }).then((res) => {
        cb(true);
      });
    });
  },
  poweroff: function(item, cb) {
    request.post({
      url: '/api/v1/' + HALO.user.projectId + '/servers/' + item.id + '/action/stop'
    }).then((res) => {
      cb(true);
    });
  }

};
