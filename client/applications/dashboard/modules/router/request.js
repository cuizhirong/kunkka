var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    var storgeList = ['router', 'network', 'subnet'];
    if (HALO.settings.enable_ipsec) {
      storgeList = storgeList.concat(['ipsec', 'vpnservice', 'ikepolicy', 'ipsecpolicy']);
    }
    return storage.getList(storgeList, forced).then((res) => {
      var exNetworks = [];
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
      return res.router;
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
