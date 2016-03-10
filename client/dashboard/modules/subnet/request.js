var storage = require('client/dashboard/cores/storage');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['subnet'], forced).then(function(data) {
      cb(data.subnet);
    });
  }
};
