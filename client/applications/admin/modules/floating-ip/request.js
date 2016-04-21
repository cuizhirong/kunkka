var storage = require('client/applications/admin/cores/storage');
var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getFilterOptions: function(forced) {
    return storage.getList([], forced);
  },
  getListInitialize: function(pageLimit, forced) {
    var req = [];
    req.push(this.getList(pageLimit));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getFloatingIPByIDInitialize: function(floatingipID, forced) {
    var req = [];
    req.push(this.getFloatingIPByID(floatingipID));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/neutron/v2.0/floatingips?all_tenants=1&limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getServerByID: function(serverID) {
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverID;
    return fetch.get({
      url: url
    }).then((res) => {
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = '/proxy/neutron/v2.0/' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getFloatingIPByID: function(floatingipID) {
    var url = '/proxy/neutron/v2.0/floatingips/' + floatingipID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  dissociateFloatingIp: function(serverId, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/action',
      data: data
    });
  },
  getRelatedSourcesById: function(item) {
    var deferredList = [];

    if(item.router_id) {
      deferredList.push(fetch.get({
        url: '/proxy/neutron/v2.0/routers/' + item.router_id
      }).then((res) => {
        item.router_name = res.router.name;
      }));
    }

    if(item.port_id) {
      deferredList.push(fetch.get({
        url: '/proxy/neutron/v2.0/ports/' + item.port_id
      }).then((res) => {
        var port = res.port;
        if(port.device_owner.indexOf('compute') === 0) {
          item.server_id = port.device_id;
          deferredList.push(fetch.get({
            url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + port.device_id
          }).then((inst) => {
            var server = inst.server;
            item.server_name = server.name;
          }));
        }
      }));
    }
    return RSVP.all(deferredList);
  },
  allocateFloatingIP: function(floatingIP, floatingNetworkID, tenantID) {
    var data = {
      'floatingip': {
        'floating_network_id': floatingNetworkID,
        'tenant_id': tenantID,
        'floating_ip_address': floatingIP
      }
    };
    return fetch.post({
      url: '/proxy/neutron/v2.0/floatingips',
      data: data
    });
  },
  getExternalNetwork: function(projectId) {
    return fetch.get({
      url: '/proxy/neutron/v2.0/networks?router:external=true'
    });
  }
};
