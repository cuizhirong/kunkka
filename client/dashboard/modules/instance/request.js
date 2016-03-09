var storage = require('client/dashboard/cores/storage');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['instance', 'image'], forced).then(function(data) {
      cb(data.instance);
    });
  },
  getSingle: function(cb, forced) {
    cb && cb([]);
  }

};
