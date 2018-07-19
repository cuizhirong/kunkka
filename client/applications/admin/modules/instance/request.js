const storage = require('client/applications/admin/cores/storage');
const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');
const download = require('client/utils/download');

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
    let req = [];
    req.push(this.getList(pageLimit));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getServerByIDInitialize: function(serverID, forced) {
    let req = [];
    req.push(this.getServerByID(serverID));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1&limit=' + pageLimit;
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
  getVolumeByIDs: function(volumeIDs) {
    let deferredList = [];
    volumeIDs.forEach((volumeID) => {
      deferredList.push(fetch.get({
        url: '/proxy-search/cinder/v2/' + HALO.user.projectId + '/volumes/detail?all_tenants=1&id=' + volumeID
      }));
    });
    return RSVP.all(deferredList);
  },
  getFilterList: function(data, pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1&limit=' + pageLimit + getParameters(data);
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    let url = '/proxy/nova/v2.1/' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  filterFromAll: function(data) {
    function requestParams(obj) {
      let str = '';
      for(let key in obj) {
        str += ('&' + key + '=' + obj[key]);
      }

      return str;
    }

    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1' + requestParams(data);
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
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  migrate: function(id, hostID, isCool) {
    let data = {};
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
  batchMigrate: function(instances, hostId) {
    const reqs = [];
    instances.forEach((instance) => {
      reqs.push(this.migrate(instance.id, hostId, instance.isCool));
    });
    return RSVP.all(reqs);
  },
  poweron: function(item) {
    let data = {};
    data['os-start'] = null;

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
      data: data
    });
  },
  poweroff: function(item) {
    let data = {};
    data['os-stop'] = null;

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
      data: data
    });
  },
  reboot: function(item) {
    let data = {};
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
  deleteItem: function(items) {
    let req = [];
    items.forEach(item => {
      req.push(fetch.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id
      }));
    });
    return RSVP.all(req);
  },
  getMeasures: function(id, granularity, start) {
    let url = '/proxy/gnocchi/v1/metric/' + id + '/measures?granularity=' + granularity + '&start=' + start;
    return fetch.get({
      url: url
    });
  },
  getResourceMeasures: function(resourceId, type, granularity, start) {
    let deferredList = [];
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
    let url = '/proxy/neutron/v2.0/ports?all_tenants=1', ips = [], datas = [];
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
      let _data = {
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
  getPjtAndUserName: function(pId, uId) {
    return RSVP.hash({
      project: fetch.get({
        url: '/proxy/keystone/v3/projects/' + pId
      }),
      user: fetch.get({
        url: '/proxy/keystone/v3/users/' + uId
      })
    }).then((res) => {
      return {
        user: res.user.user,
        project: res.project.project
      };
    });
  },
  getProjectById: function(pId) {
    return fetch.get({
      url: '/proxy/keystone/v3/projects/' + pId
    });
  },
  exportCSV(fields) {
    return this.getDomains().then((domains) => {
      let currentDomain = HALO.configs.domain;
      let domainID = domains.find((ele) => ele.name === currentDomain).id;

      let url = '/proxy/csv/nova/v2.1/' + HALO.user.projectId + '/servers/detail?all_tenants=1' + getParameters(fields) + '&domain_id=' + domainID;
      return download(url);
    });
  },
  getDomains: function() {
    return fetch.get({
      url: '/proxy/keystone/v3/domains'
    }).then((res) => {
      let domains = [];
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
  },
  getDiskMeasures: function(ids, granularity, start) {
    let deferredList = [];
    ids.forEach((id) => {
      deferredList.push(fetch.get({
        url: '/proxy/gnocchi/v1/metric/' + id + '/measures?granularity=' + granularity + '&start=' + start
      }));
    });
    return RSVP.all(deferredList);
  },
  getDiskResourceId: function(ids, granularity) {
    let deferredList = [];
    ids.forEach(id => {
      deferredList.push(fetch.post({
        url: '/proxy/gnocchi/v1/search/resource/instance_disk',
        data: {
          '=': {
            original_resource_id: id
          }
        }
      }));
    });
    return RSVP.all(deferredList);
  }
};
