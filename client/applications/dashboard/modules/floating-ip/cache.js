const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getFloatingipList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/floatingips?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      let enableBandwidth = HALO.settings.enable_floatingip_bandwidth;
      if (enableBandwidth) {
        fetch.get({
          url: '/proxy/neutron/v2.0/uplugin/fipratelimits'
        }).then(res => {
          res.fipratelimits.forEach(limit => {
            data.floatingips.some(ip => {
              if (limit.floatingip_id === ip.id) {
                ip.rate_limit = limit.rate;
              }
            })
          })
        });
      }
      return data.floatingips;
    });
  },
  getFplimitList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/uplugin/fipratelimits'
    }).then(res => {
      return res.fipratelimits;
    });
  }
};
