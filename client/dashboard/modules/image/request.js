var storage = require('client/dashboard/cores/storage');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['image', 'instance'], forced).then(function(data) {
      cb(data.image);
    });
  },
  getSingle: function(cb, forced) {
    cb && cb([]);
  }

};
