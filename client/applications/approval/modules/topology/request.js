var storage = require('client/applications/dashboard/cores/storage');

module.exports = {
  getList: function(forced) {
    return storage.getList(['network', 'instance', 'router'], forced).then(function(data) {
      data.network = data.network.filter((n) => {
        if (n['router:external']) {
          return false;
        }
        return true;
      });
      return data;
    });
  }
};
