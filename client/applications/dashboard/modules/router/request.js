var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return this.getVpnServiceList().then((res) => {
      return storage.getList(['router', 'network', 'subnet'], forced).then(function(data) {
        var exNetworks = [];
        data.network.forEach((item) => {
          if (item['router:external']) {
            exNetworks.push(item);
            return true;
          }
          return false;
        });

        if(exNetworks.length > 1) {
          data.router.forEach(r => {
            if(r.external_gateway_info) {
              exNetworks.some(n => {
                if(r.external_gateway_info.network_id === n.id) {
                  r.external_gateway_info.network_name = n.name;
                  return true;
                }
                return false;
              });
            }
          });
        }

        data.router.forEach((router, index) => {
          data.router[index].vpnservices = [];
          data.router[index].ipsec_site_connections = [];
        });
        res.vpnservices.forEach((vpnService) => {
          data.router.forEach((router, index) => {
            if (vpnService.router_id === router.id) {
              data.router[index].vpnservices.push(vpnService);
            }
          });
        });

        res.vpnservices.forEach((vpnService, index) => {
          data.subnet.forEach((subnet) => {
            if (vpnService.subnet_id === subnet.id) {
              res.vpnservices[index].subnet = subnet;
            }
          });
        });

        data.router.forEach((router, index) => {
          data.router[index].vpnservices.forEach((vpnservice) => {
            res.ipsec_site_connections.forEach((site) => {
              if (site.vpnservice_id === vpnservice.id) {
                data.router[index].ipsec_site_connections.push(site);
              }
            });
          });
        });
        return data.router;
      });
    });
  },
  getPrices: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/products'
    });
  },
  editRouterName: function(item, newName) {
    var data = {};
    data.router = {};
    data.router.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + item.id,
      data: data
    });
  },
  deleteRouters: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/routers/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createRouter: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/routers',
      data: {
        router: data
      }
    });
  },
  updateRouter: function(routerId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId,
      data: {
        router: data
      }
    });
  },
  addInterface: function(routerId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/add_router_interface',
      data: data
    });
  },
  changeFip: function(routerId, fipId) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/floatingips/' + fipId,
      data: {
        floatingip: {
          port_id: routerId
        }
      }
    });
  },
  getGateway: function() {
    return storage.getList(['network']).then(function(data) {
      var exNetworks = [];
      data.network.forEach((item) => {
        if (item['router:external']) {
          exNetworks.push(item);
          return true;
        }
        return false;
      });
      return exNetworks;
    });
  },
  getSubnets: function(forced) {
    return storage.getList(['subnet'], forced).then(function(data) {
      return data.subnet;
    });
  },
  detachSubnet: function(item) {
    var data = {};
    data.subnet_id = item.childItem.id;

    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + item.rawItem.id + '/remove_router_interface',
      data: data
    });
  },
  getIpsecTunnelList: function() {
    var url = '/proxy/neutron/v2.0/vpn/ipsec-site-connections',
      that = this;
    return fetch.get({
      url: url
    }).then(res => {
      var _res = res.ipsec_site_connections.map((ipsec, index) => {
        return that.getIkePolicyById(ipsec.ikepolicy_id).then(ike => {
          res.ipsec_site_connections[index].ikepolicy = [];
          res.ipsec_site_connections[index].ikepolicy = [ike.ikepolicy];
          return that.getIpsecPolicyById(ipsec.ipsecpolicy_id).then(_ipsec => {
            res.ipsec_site_connections[index].ipsecpolicy = [_ipsec.ipsecpolicy];
            return that.getVpnServiceById(ipsec.vpnservice_id).then(vpnservice => {
              res.ipsec_site_connections[index].vpnservice = [vpnservice.vpnservice];
              return res;
            });
          });
        });
      });
      return RSVP.all(_res);
    });
  },
  getVpnServiceList: function() {
    var that = this;
    var url = '/proxy/neutron/v2.0/vpn/vpnservices';
    return fetch.get({
      url: url
    }).then(function(data) {
      return that.getIpsecTunnelList().then(tunnels => {
        data.ipsec_site_connections = tunnels[0].ipsec_site_connections;
        return data;
      });
    });
  },
  getVpnServiceById: function(id) {
    var url = '/proxy/neutron/v2.0/vpn/vpnservices/' + id;
    return fetch.get({
      url: url
    });
  },
  createVpnService: function(data) {
    var url = '/proxy/neutron/v2.0/vpn/vpnservices';
    return fetch.post({
      url: url,
      data: data
    }).then(res => {
      return res.vpnservice;
    });
  },
  deleteVpnService: function(id) {
    var url = '/proxy/neutron/v2.0/vpn/vpnservices/' + id;
    return fetch.delete({
      url: url
    });
  },
  getIkePolicis: function() {
    var url = '/proxy/neutron/v2.0/vpn/ikepolicies';
    return fetch.get({
      url: url
    }).then(res => {
      res.ikepolicies.forEach((item) => {
        item.sa_lifetime = item.lifetime.value + ' s';
      });
      return res;
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
  getIpsecPolicies: function() {
    var url = '/proxy/neutron/v2.0/vpn/ipsecpolicies';
    return fetch.get({
      url: url
    }).then(res => {
      res.ipsecpolicies.forEach((item) => {
        item.sa_lifetime = item.lifetime.value + ' s';
      });
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
  createTunnel: function(data) {
    var url = '/proxy/neutron/v2.0/vpn/ipsec-site-connections';
    return fetch.post({
      url: url,
      data: data
    });
  },
  updateIpsecConnection: function(id, data) {
    var url = '/proxy/neutron/v2.0/vpn/ipsec-site-connections/' + id;
    return fetch.put({
      url: url,
      data: data
    }).then(res => {
      return res;
    });
  },
  deleteIpsecConnection: function(id) {
    var url = '/proxy/neutron/v2.0/vpn/ipsec-site-connections/' + id;
    return fetch.delete({
      url: url
    });
  }
};
