var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');
var Promise = RSVP.Promise;

function getParameters(fields) {
  let ret = '';
  for(let f in fields) {
    ret += '&' + f + '=' + fields[f];
  }
  return ret;
}

module.exports = {
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
    }).catch((res) => {
      res._url = url;
      return res;
    });
  },
  getFilterList: function(data, pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }
    var url = '/proxy/neutron/v2.0/floatingips?all_tenants=1&limit=' + pageLimit + getParameters(data);
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
    }).catch((res) => {
      res._url = url;
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
    }).catch((res) => {
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
    }).catch((res) => {
      res._url = url;
      return res;
    });
  },
  dissociateFloatingIp: function(fipID, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/floatingips/' + fipID,
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
          return port.device_id;
        }
      }).then((res) => {
        if(res) {
          return fetch.get({
            url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + res
          });
        }
      }
      ).then((inst) => {
        if(inst) {
          var server = inst.server;
          item.server_name = server.name;
        }
      }));
    }
    return RSVP.all(deferredList);
  },
  allocateFloatingIP: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/floatingips',
      data: data
    });
  },
  getExternalNetwork: function(projectId) {
    return fetch.get({
      url: '/proxy/neutron/v2.0/networks?router:external=true'
    });
  },
  getFieldsList: function() {
    return fetch.get({
      url: '/proxy/csv-field/floatingips'
    });
  },
  exportCSV(fields) {
    let url = '/proxy/csv/neutron/v2.0/floatingips?all_tenants=1' + getParameters(fields);
    function ret() {
      var linkNode = document.createElement('a');
      linkNode.href = url;
      linkNode.click();
      linkNode = null;
      return 1;
    }
    return new Promise((resolve, reject) => {
      resolve(ret());
    });
  }
};
