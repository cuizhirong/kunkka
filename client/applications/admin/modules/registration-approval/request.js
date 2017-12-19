const fetch = require('client/applications/admin/cores/fetch');
const RSVP = require('rsvp');

function createNetwork(pId) {
  const network = {
    name: 'defaultNetwork',
    project_id: pId
  };

  return fetch.post({
    url: '/proxy/neutron/v2.0/networks',
    data: {
      network: network
    }
  });
}

function getExternalNetwork(pId) {
  return fetch.get({
    url: '/api/v1/networks?tenant_id=' + pId
  }).then(function (data) {
    let exNetworks = [];
    exNetworks = data.networks.filter((item) => {
      if (item['router:external']) {
        return true;
      }
      return false;
    });
    return exNetworks;
  });
}

function createSubnet(network) {
  const subnet = {
    name: 'defaultSubnet',
    network_id: network.id,
    project_id: network.project_id,
    ip_version: 4,
    cidr: '192.168.1.0/24'
  };

  return fetch.post({
    url: '/proxy/neutron/v2.0/subnets?tenant_id=' + HALO.user.projectId,
    data: {
      subnet: subnet
    }
  });
}

function createRouter(network, exNetwork) {
  const router = {
    name: 'defaultRouter',
    project_id: network.project_id,
    external_gateway_info: {
      network_id: exNetwork.id
    }
  };

  return fetch.post({
    url: '/proxy/neutron/v2.0/routers',
    data: {
      router: router
    }
  });
}

function bindRouter(subnetId, routerId) {
  return fetch.put({
    url: '/proxy/neutron/v2.0/routers/' + routerId + '/add_router_interface',
    data: {
      subnet_id: subnetId
    }
  });
}

function deleteUser(userId) {
  let url = '/proxy/keystone/v3/users/' + userId;

  return fetch.delete({
    url: url
  });
}

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }
    let url = '/api/approve-user?status=pending&limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then(function(res) {
      res._url = 1;
      return res;
    });
  },
  getNextList: function(nextUrl, pageLimit) {
    let url = '/api/approve-user?status=pending&limit=' + pageLimit +
      '&page=' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = nextUrl;
      return res;
    });
  },
  getFilterList: function() {
    let url = '/api/approve-user?status=pending';

    return fetch.get({
      url: url
    }).then((res) => {
      res._url = 1;
      return res;
    });
  },
  agreeApplication: function(userId) {
    let url = '/api/approve-user/' + userId;

    return fetch.put({
      url: url,
      data: {
        status: 'pass'
      }
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  refuseApplication: function(userId, msg) {
    let url = '/api/approve-user/' + userId;

    return fetch.put({
      url: url,
      data: {
        status: 'refused',
        message: msg
      }
    }).then((res) => {
      res._url = url;
      deleteUser(userId);
      return res;
    });
  },
  createNetworkAndSoOn: function(pId) {
    const requests = {
      network: createNetwork(pId),
      exNetworks: getExternalNetwork(pId)
    };

    return RSVP.hash(requests).then((res) => {
      const network = res.network.network;
      const exNetworks = res.exNetworks;

      if(exNetworks.length === 0) {
        let err = new Error();
        err.name = 'noExNetwork';
        throw err;
      }

      return RSVP.hash({
        subnet: createSubnet(network),
        router: createRouter(network, exNetworks[0])
      });
    }).then((res) => {
      const subnetId = res.subnet.subnet.id;
      const routerId = res.router.router.id;

      return bindRouter(subnetId, routerId);
    });
  }
};
