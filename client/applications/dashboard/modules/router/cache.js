var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getRouterList: function() {
    return fetch.get({
      url: '/api/v1/routers?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.routers;
    });
  },
  getVpnserviceList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/vpn/vpnservices'
    }).then(function(data) {
      return data.vpnservices;
    });
  },
  getIkePolicyById: function(id) {
    var url = '/proxy/neutron/v2.0/vpn/ikepolicies/' + id;
    return fetch.get({
      url: url
    }).then(res => {
      res.ikepolicy.sa_lifetime = res.ikepolicy.lifetime.value + ' s';
      return res;
    });
  },
  getIpsecPolicyById: function(id) {
    var url = '/proxy/neutron/v2.0/vpn/ipsecpolicies/' + id;
    return fetch.get({
      url: url
    }).then(res => {
      res.ipsecpolicy.sa_lifetime = res.ipsecpolicy.lifetime.value + ' s';
      return res;
    });
  },
  getVpnServiceById: function(id) {
    var url = '/proxy/neutron/v2.0/vpn/vpnservices/' + id;
    return fetch.get({
      url: url
    });
  },
  getIpsecList: function() {
    var that = this;
    return fetch.get({
      url: '/proxy/neutron/v2.0/vpn/ipsec-site-connections'
    }).then(function(res) {
      var _res = res.ipsec_site_connections.map((ipsec, index) => {
        return that.getIkePolicyById(ipsec.ikepolicy_id).then((ike) => {
          res.ipsec_site_connections[index].ikepolicy = [ike.ikepolicy];
          return that.getIpsecPolicyById(ipsec.ipsecpolicy_id).then((_ipsec) => {
            res.ipsec_site_connections[index].ipsecpolicy = [_ipsec.ipsecpolicy];
            return that.getVpnServiceById(ipsec.vpnservice_id).then((vpn) => {
              res.ipsec_site_connections[index].vpnservice = [vpn.vpnservice];
              return res;
            });
          });
        });
      });
      return RSVP.all(_res);
    });
  }
};
