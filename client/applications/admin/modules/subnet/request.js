const fetch = require('client/applications/admin/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }
    let url = '/proxy-search/neutron/v2.0/subnets?limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then(function(res) {
      res._url = url;
      return res;
    });
  },
  getSubnet: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/subnets?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.subnets;
    });
  },
  getNextList: function(nextUrl) {
    let url = nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getFilterList: function(data, pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    function getParameters(fields) {
      let ret = '';
      for(let f in fields) {
        ret += '&' + f + '=' + fields[f];
      }
      return ret;
    }
    let url = '/proxy/neutron/v2.0/subnets?all_tenants=1&limit=' + pageLimit + getParameters(data);

    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getSubnetByID: function(SubnetID) {
    let url = '/proxy-search/neutron/v2.0/subnets?id=' + SubnetID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    }).catch((res) => {
      res._url = url;
      return res;
    });
  },
  editSubnetName: function(item, newName) {
    let data = {};
    data.subnet = {};
    data.subnet.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/subnets/' + item.id,
      data: data
    });
  },
  deleteSubnets: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/subnets/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createSubnet: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/subnets?tenant_id=' + HALO.user.projectId,
      data: {
        subnet: data
      }
    });
  },
  updateSubnet: function(subnetId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/subnets/' + subnetId,
      data: {
        subnet: data
      }
    });
  },
  connectRouter: function(routerId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/add_router_interface',
      data: data
    });
  },
  disconnectRouter: function(routerId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/remove_router_interface',
      data: data
    });
  },
  addInstance: function(serverId, networkId) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/os-interface',
      data: networkId
    });
  },
  getNetworks: function() {
    return fetch.get({
      url: '/api/v1/networks?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.networks.filter((n) => {
        if (n['router:external']) {
          return false;
        }
        return true;
      });
    });
  },
  getInstances: function(projectid) {
    return fetch.get({
      url: '/proxy/nova/v2.1/servers/detail?project_id=' + projectid
    }).then(function(data) {
      return data.servers;
    });
  },
  getRouters: function(projectid) {
    return fetch.get({
      url: '/api/v1/routers?tenant_id=' + projectid
    }).then(function(res) {
      return res.routers;
    });
  },
  deletePort: function(item) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/ports/' + item.id
    });
  },
  createPort: function(port) {
    let data = {
      port: port
    };
    return fetch.post({
      url: '/proxy/neutron/v2.0/ports',
      data: data
    });
  }
};
