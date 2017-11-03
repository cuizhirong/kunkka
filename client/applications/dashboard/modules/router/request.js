const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    let storgeList = ['router', 'network', 'subnet'];
    if (HALO.settings.enable_ipsec) {
      storgeList = storgeList.concat(['ipsec', 'vpnservice', 'ikepolicy', 'ipsecpolicy']);
    }
    if (HALO.settings.enable_floatingip_bandwidth) {
      storgeList = storgeList.concat(['gwlimit']);
    }
    return storage.getList(storgeList, forced).then((res) => {
      let exNetworks = [];
      res.network.forEach((item) => {
        if (item['router:external']) {
          exNetworks.push(item);
          return true;
        }
        return false;
      });

      if(exNetworks.length > 1) {
        res.router.forEach(r => {
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
      if (HALO.settings.enable_ipsec) {
        res.router.forEach((router, index) => {
          res.router[index].vpnservices = [];
          res.router[index].ipsec_site_connections = [];
          res.router[index].ikepolicies = [];
          res.router[index].ipsecpolicies = [];
        });
        res.vpnservice.forEach((vpnService) => {
          res.router.forEach((router, index) => {
            if (vpnService.router_id === router.id) {
              res.router[index].vpnservices.push(vpnService);
            }
          });
        });

        res.vpnservice.forEach((vpnService, index) => {
          res.subnet.forEach((subnet) => {
            if (vpnService.subnet_id === subnet.id) {
              res.vpnservice[index].subnet = subnet;
            }
          });
        });

        res.router.forEach((router, index) => {
          res.router[index].ikepolicies = res.ikepolicy.ikepolicies;
          res.router[index].ipsecpolicies = res.ipsecpolicy.ipsecpolicies;
          res.router[index].vpnservices.forEach((vpnservice) => {
            res.ipsec[0] && res.ipsec[0].ipsec_site_connections.forEach((site) => {
              if (site.vpnservice_id === vpnservice.id) {
                res.router[index].ipsec_site_connections.push(site);
              }
            });
          });
        });
      }
      if (HALO.settings.enable_floatingip_bandwidth) {
        res.gwlimit.forEach(limit => {
          res.router.some((r, index) => {
            if (limit.router_id === r.id) {
              res.router[index].rate_limit = limit.rate;
            }
          });
        });
      }
      return res.router;
    });
  },
  editRouterName: function(item, newName) {
    let data = {};
    data.router = {};
    data.router.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + item.id,
      data: data
    });
  },
  deleteRouters: function(items) {
    let deferredList = [];
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
      let exNetworks = [];
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
    let data = {};
    data.subnet_id = item.childItem.id;

    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + item.rawItem.id + '/remove_router_interface',
      data: data
    });
  },
  createVpnService: function(data) {
    let url = '/proxy/neutron/v2.0/vpn/vpnservices';
    return fetch.post({
      url: url,
      data: data
    }).then(res => {
      return res.vpnservice;
    });
  },
  deleteVpnService: function(id) {
    let url = '/proxy/neutron/v2.0/vpn/vpnservices/' + id;
    return fetch.delete({
      url: url
    });
  },
  createTunnel: function(data) {
    let url = '/proxy/neutron/v2.0/vpn/ipsec-site-connections';
    return fetch.post({
      url: url,
      data: data
    });
  },
  updateIpsecConnection: function(id, data) {
    let url = '/proxy/neutron/v2.0/vpn/ipsec-site-connections/' + id;
    return fetch.put({
      url: url,
      data: data
    }).then(res => {
      return res;
    });
  },
  deleteIpsecConnection: function(id) {
    let url = '/proxy/neutron/v2.0/vpn/ipsec-site-connections/' + id;
    return fetch.delete({
      url: url
    });
  },
  getPortForwarding: function(routerId) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/get_router_portforwarding'
    });
  },
  createPortForwarding: function(routerId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/add_router_portforwarding',
      data: data
    });
  },
  deletePortForwarding: function(routerId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/remove_router_portforwarding',
      data: data
    });
  },
  createLimit: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/uplugin/gwratelimits',
      data: data
    });
  },
  deleteLimit: function(id) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/uplugin/gwratelimits/' + id
    });
  },
  changeBandwidth: function(id, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/uplugin/gwratelimits/' + id,
      data: data
    });
  }
};
