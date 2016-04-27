var storage = require('client/applications/dashboard/cores/storage');

module.exports = {
  getList: function(forced) {
    return storage.getList(['network', 'subnet'], forced).then(function(data) {
      return data.network.filter((n) => {
        if (n['router:external']) {
          return false;
        }
        return true;
      });
    });
  }
};
