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

    var url = '/api/v1/' + HALO.user.projectId + '/ports?all_tenants=1&limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      /*res.subnet = [];
      res.ports.forEach((_res) => {
        _res.fixed_ips.forEach((ips) => {
          _res.subnet.push(this.getSubnetByID(ips.subnet_id)._result.subnet);
        })
        res.ports = _res;
      });
      console.log(res);*/
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = '/api/v1/' + nextUrl;
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
  }
};
