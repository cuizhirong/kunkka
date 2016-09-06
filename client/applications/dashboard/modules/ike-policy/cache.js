var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getIkepolicyList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/vpn/ikepolicies'
    }).then((res) => {
      res.ikepolicies.forEach((item) => {
        item.sa_lifetime = item.lifetime.value + ' s';
      });
      return res;
    });
  }
};
