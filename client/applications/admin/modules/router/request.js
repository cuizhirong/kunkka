const fetch = require('client/applications/admin/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(pageLimit) {
    let that = this;
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }
    let url = '/proxy-search/neutron/v2.0/routers?limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then(function(res) {
      res._url = url;

      return that.getAllRouter(res.list).then(agent => {
        res.list.forEach((r, index) => r.agents = agent[index].agents);
        return res;
      });
    });
  },
  getNextList: function(nextUrl) {
    let url = nextUrl;
    let that = this;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return that.getAllRouter(res.list).then(agent => {
        res.list.forEach((r, index) => r.agents = agent[index].agents);
        return res;
      });
    });
  },
  getFilterList: function(data, pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let that = this;

    function getParameters(fields) {
      let ret = '';
      for(let f in fields) {
        ret += '&' + f + '=' + fields[f];
      }
      return ret;
    }
    let url = '/proxy-search/neutron/v2.0/routers?limit=' + pageLimit + getParameters(data);

    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return that.getAllRouter(res.list).then(agent => {
        res.list.forEach((r, index) => r.agents = agent[index].agents);
        return res;
      });
    });
  },
  getRouterByID: function(RouterID) {
    let that = this;
    let url = '/proxy-search/neutron/v2.0/routers?id=' + RouterID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return that.getAgentStatus(RouterID).then(agent => {
        res.list[0].agents = agent.agents;
        return res;
      });
    }).catch((res) => {
      res._url = url;
      return res;
    });
  },
  getPrices: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/products'
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
    return fetch.get({
      url: '/api/v1/networks?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      let exNetworks = [];
      data.networks.forEach((item) => {
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
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/subnets?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.subnets;
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
  getAgentStatus: function(routerId) {
    return fetch.get({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/l3-agents.json'
    });
  },
  getAllRouter: function(routers) {
    let deferredList = [];
    routers.forEach((item) => {
      deferredList.push(this.getAgentStatus(item.id));
    });
    return RSVP.all(deferredList);
  },
  deleteAgent: function(agentIds, routerId) {
    let deferredList = [];
    agentIds.forEach((id) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/agents/' + id + '/l3-routers/' + routerId
      }));
    });
    return RSVP.all(deferredList);
  },
  repairAgent: function(agentIds, routerId) {
    let deferredList = [];
    agentIds.forEach((id) => {
      deferredList.push(fetch.post({
        url: '/proxy/neutron/v2.0/agents/' + id + '/l3-routers.json',
        data: {router_id: routerId}
      }));
    });
    return RSVP.all(deferredList);
  }
};
