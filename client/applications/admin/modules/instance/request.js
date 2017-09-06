var storage = require('client/applications/admin/cores/storage');
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
  getFilterOptions: function(forced) {
    return storage.getList(['imageType', 'flavorType', 'hostType'], forced);
  },
  getListInitialize: function(pageLimit, forced) {
    var req = [];
    req.push(this.getList(pageLimit));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getServerByIDInitialize: function(serverID, forced) {
    var req = [];
    req.push(this.getServerByID(serverID));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1&limit=' + pageLimit;
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
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1&limit=' + pageLimit + getParameters(data);
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = '/proxy/nova/v2.1/' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  filterFromAll: function(data) {
    function requestParams(obj) {
      var str = '';
      for(let key in obj) {
        str += ('&' + key + '=' + obj[key]);
      }

      return str;
    }

    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1' + requestParams(data);
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
    var url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  migrate: function(id, hostID, isCool) {
    var data = {};
    if(isCool) {
      data = {
        'migrate': null
      };
    } else {
      data = {
        'os-migrateLive': {
          'host': hostID,
          'block_migration': false,
          'disk_over_commit': false
        }
      };
    }

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + id + '/action',
      data: data
    });
  },
  poweron: function(item) {
    var data = {};
    data['os-start'] = null;

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
      data: data
    });
  },
  poweroff: function(item) {
    var data = {};
    data['os-stop'] = null;

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
      data: data
    });
  },
  reboot: function(item) {
    var data = {};
    data.reboot = {};
    data.reboot.type = 'SOFT';

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
      data: data
    });
  },
  dissociateFloatingIp: function(serverId, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/action',
      data: data
    });
  },
  deleteItem: function(item) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id
    });
  },
  getMeasures: function(id, granularity, start) {
    var url = '/proxy/gnocchi/v1/metric/' + id + '/measures?granularity=' + granularity + '&start=' + start;
    return fetch.get({
      url: url
    });
  },
  getResourceMeasures: function(resourceId, type, granularity, start) {
    var deferredList = [];
    type.forEach((t) => {
      deferredList.push(fetch.get({
        url: '/proxy/gnocchi/v1/resource/generic/' + resourceId + '/metric/' + t + '/measures?granularity=' + granularity + '&start=' + start
      }));
    });
    return RSVP.all(deferredList);
  },
  getNetworkResourceId: function(id) {
    let url = '/proxy/gnocchi/v1/search/resource/instance_network_interface',
      data = {
        '=': {
          instance_id: id
        }
      };
    return fetch.post({
      url: url,
      data: data
    });
  },
  getNetworkResource: function(granularity, start, _data, resourceData) {
    let ids = [], deferredList = [];
    resourceData.forEach(_portData => {
      ids.push(_portData.metrics['network.incoming.bytes.rate']);
      ids.push(_portData.metrics['network.outgoing.bytes.rate']);
      ids.forEach(_id => {
        deferredList.push(this.getMeasures(_id, granularity, start));
      });
      ids = [];
    });
    return RSVP.all(deferredList);
  },
  getPort: function(data) {
    var url = '/proxy/neutron/v2.0/ports?all_tenants=1', ips = [], datas = [];
    return fetch.get({
      url: url
    }).then(res => {
      res.ports.forEach(port => {
        data.forEach((d, index) => {
          if (port.id.substr(0, 11) === d.name.substr(3)) {
            ips.push(port.fixed_ips[0].ip_address);
            datas.push(d);
          }
        });
      });
      var _data = {
        ips: ips,
        datas: datas
      };
      return _data;
    });
  },
  getFieldsList: function() {
    return fetch.get({
      url: '/proxy/csv-field/servers'
    });
  },
  exportCSV(fields) {
    return this.getDomains().then((domains) => {
      var currentDomain = HALO.configs.domain;
      var domainID = domains.find((ele) => ele.name === currentDomain).id;

      let url = '/proxy/csv/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1' + getParameters(fields) + '&domain_id=' + domainID;
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
    });
  },
  getDomains: function() {
    return fetch.get({
      url: '/proxy/keystone/v3/domains'
    }).then((res) => {
      var domains = [];
      res.domains.forEach((domain) => {
        if (domain.id === 'defult') {
          domain.unshift(domain);
        } else {
          domains.push(domain);
        }
      });
      return domains;
    });
  },
  getActionLog: function(id) {
    return fetch.get({
      url: '/proxy/nova/v2.1/servers/' + id + '/os-instance-actions'
    });
  }
};
