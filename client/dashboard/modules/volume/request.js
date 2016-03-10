var storage = require('client/dashboard/cores/storage');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['volume'], forced).then(function(data) {
      cb(data.volume);
    });
  }
};
