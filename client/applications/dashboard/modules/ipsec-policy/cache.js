const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getIpsecpolicyList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/vpn/ipsecpolicies'
    }).then((res) => {
      res.ipsecpolicies.forEach((item) => {
        item.sa_lifetime = item.lifetime.value + ' s';
      });
      return res;
    });
  }
};
