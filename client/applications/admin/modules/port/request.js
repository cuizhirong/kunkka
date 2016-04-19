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
  getPortByIDInitialize: function(portID, forced) {
    var req = [];
    req.push(this.getPortByID(portID));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/neutron/v2.0/ports?all_tenants=1&limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getSubnet: function() {
    var url = '/proxy/neutron/v2.0/subnets';
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
  getPortByID: function(portID) {
    var url = '/proxy/neutron/v2.0/ports/' + portID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  deletePorts: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/ports/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  editPortName: function(item, newName) {
    var data = {};
    data.port = {};
    data.port.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/ports/' + item.id,
      data: data
    });
  },
  getDeviceById: function(item) {
    var device = item.device_owner;
    switch(0) {
      case device.indexOf('network:router'):
        return fetch.get({
          url: '/proxy/neutron/v2.0/routers/' + item.device_id
        }).then((res) => {
          item.device_name = res.router.name;
        });
      case device.indexOf('compute'):
        return fetch.get({
          url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.device_id
        }).then((res) => {
          item.device_name = res.server.name;
        });
      default:
        break;
    }
  },
  getSubnetsById: function(subnets) {
    var deferredList = [];
    subnets.forEach((subnet) => {
      deferredList.push(fetch.get({
        url: '/proxy/neutron/v2.0/subnets/' + subnet.subnet_id
      }).then((res) => {
        subnet.subnet_name = res.subnet.name;
      }));
    });
    return RSVP.all(deferredList);
  }
};
