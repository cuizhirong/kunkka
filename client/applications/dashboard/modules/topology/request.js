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

      var instanceList = data.instance.map((m) => {
        return {
          name: m.name,
          id: m.id,
          addresses: m.addresses,
          status: m.status
        };
      });

      data.network.forEach((n) => {
        n.subnets.forEach((s) => {
          // console.log(s.addresses)
          instanceList.some((instance) => {
            var addrs = instance.addresses;
            Object.keys(addrs).some((key) => {
              // if (addrs[key]) {}
            });
          });
        });
      });

      console.log(data);
      return data;
    });
  }
};
