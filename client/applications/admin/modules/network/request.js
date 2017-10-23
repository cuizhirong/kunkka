const fetch = require('client/applications/admin/cores/fetch');
const RSVP = require('rsvp');

function requestParams(obj) {
  let str = '';
  for(let key in obj) {
    if(key === 'name') {
      str += ('&search=' + obj[key]);
    } else {
      str += ('&' + key + '=' + obj[key]);
    }
  }

  return str;
}

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy-search/neutron/v2.0/networks?limit=' + pageLimit;
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
  getServerByID: function(serverID) {
    let url = '/proxy-search/neutron/v2.0/networks/' + serverID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
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
    let url = '/proxy-search/neutron/v2.0/networks?limit=' + pageLimit + getParameters(data);

    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNetworkByID: function(NetworkID) {
    let url = '/proxy-search/neutron/v2.0/networks?id=' + NetworkID;
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
  filter: function(data, pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy-search/neutron/v2.0/networks?limit=' + pageLimit + requestParams(data);
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
  editNetworkName: function(item, newName) {
    let data = {};
    data.network = {};
    data.network.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/networks/' + item.id,
      data: data
    });
  },
  deleteNetworks: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/networks/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createNetwork: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/networks',
      data: {
        network: data
      }
    });
  },
  createSubnet: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/subnets?tenant_id=' + HALO.user.projectId,
      data: {
        subnet: data
      }
    });
  },
  deleteSubnet: function(item) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/subnets/' + item.id
    });
  }
};
