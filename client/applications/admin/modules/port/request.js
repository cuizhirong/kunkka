const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy/neutron/v2.0/ports?all_tenants=1&limit=' + pageLimit;
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

    function getParameters(fields) {
      let ret = '';
      for(let f in fields) {
        ret += '&' + f + '=' + fields[f];
      }
      return ret;
    }
    let url = '/proxy/neutron/v2.0/ports?all_tenants=1&limit=' + pageLimit + getParameters(data);

    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getSubnet: function() {
    let url = '/proxy/neutron/v2.0/subnets';
    return fetch.get({
      url: url
    }).then((res) => {
      return res;
    });
  },
  getNextList: function(nextUrl) {
    let url = '/proxy/neutron/v2.0/' + nextUrl;
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
  getPortByID: function(portID) {
    let url = '/proxy/neutron/v2.0/ports/' + portID;
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
  deletePorts: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/ports/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  editPortName: function(item, newName) {
    let data = {};
    data.port = {};
    data.port.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/ports/' + item.id,
      data: data
    });
  },
  getDeviceById: function(item) {
    let device = item.device_owner;
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
      case device.indexOf('network:floatingip'):
        return fetch.get({
          url: '/proxy/neutron/v2.0/floatingips/' + item.device_id
        }).then((res) => {
          item.floating_ip_address = res.floatingip.floating_ip_address;
        });
      default:
        break;
    }
  },
  getSubnetsById: function(subnets) {
    let deferredList = [];
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
