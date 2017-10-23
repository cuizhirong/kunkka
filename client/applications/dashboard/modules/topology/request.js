const storage = require('client/applications/dashboard/cores/storage');

module.exports = {
  getList: function(forced) {
    return storage.getList(['network', 'instance', 'router', 'loadbalancer', 'floatingip'], forced).then(function(data) {
      data.network = data.network.filter((n) => {
        if (n['router:external']) {
          return false;
        }
        return true;
      });
      data.loadbalancer.forEach(lb => {
        data.floatingip.some(fip => {
          if(lb.vip_port_id === fip.port_id) {
            lb.floatingip = fip;
            return true;
          }
          return false;
        });
      });
      return data;
    });
  }
};
