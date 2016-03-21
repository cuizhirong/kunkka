var storage = require('client/dashboard/cores/storage');

module.exports = {
  getList: function(forced) {
    return storage.getList(['image'], forced).then(function(data) {
      return data.image;
    });
  }

};
