var storage = require('client/dashboard/cores/storage');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['snapshot'], forced).then(function(data) {
      cb(data.snapshot);
    });
  }
};
