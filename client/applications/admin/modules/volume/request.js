const storage = require('client/applications/admin/cores/storage');
const fetch = require('../../cores/fetch');
const __ = require('locale/client/admin.lang.json');
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
    return storage.getList([], forced);
  },
  getListInitialize: function(pageLimit, forced) {
    let req = [];
    req.push(this.getList(pageLimit));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getVolumeByIDInitialize: function(volumeID, forced) {
    let req = [];
    req.push(this.getVolumeByID(volumeID));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy-search/cinder/v2/' + HALO.user.projectId + '/volumes/detail?all_tenants=1&limit=' + pageLimit;
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
    let url = '/proxy-search/cinder/v2/' + HALO.user.projectId + '/volumes/detail?all_tenants=1&limit=' + pageLimit + getParameters(data);
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
  getVolumeByID: function(volumeID) {
    let url = '/proxy-search/cinder/v2/' + HALO.user.projectId + '/volumes/detail?all_tenants=1&id=' + volumeID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getServerById: function(serverID) {
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverID;
    return fetch.get({
      url: url
    });
  },
  filterFromAll: function(data, pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

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
    let url = '/proxy-search/cinder/v2/' + HALO.user.projectId + '/volumes/detail?all_tenants=1&limit=' + pageLimit + requestParams(data);
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  editVolumeName: function(item, newName) {
    let data = {};
    data.volume = {};
    data.volume.name = newName;

    return fetch.put({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id,
      data: data
    });
  },
  deleteVolumes: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  detachInstance: function(data) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + data.serverId + '/os-volume_attachments/' + data.attachmentId
    });
  },
  getMeasures: function(ids, granularity, start) {
    let deferredList = [];
    ids.forEach((id) => {
      deferredList.push(fetch.get({
        url: '/proxy/gnocchi/v1/metric/' + id + '/measures?granularity=' + granularity + '&start=' + start
      }));
    });
    return RSVP.all(deferredList);
  },
  getNetworkResourceId: function(id, granularity) {
    let url = '/proxy/gnocchi/v1/search/resource/instance_disk',
      data = {
        '=': {
          original_resource_id: id
        }
      };
    return fetch.post({
      url: url,
      data: data
    });
  },
  getFieldsList: function() {
    return fetch.get({
      url: '/proxy/csv-field/volumes'
    });
  },
  exportCSV(fields) {
    return this.getDomains().then((domains) => {
      let currentDomain = HALO.configs.domain;
      let domainID = domains.find((ele) => ele.name === currentDomain).id;

      let url = '/proxy/csv/cinder/v2/' + HALO.user.projectId + '/volumes/detail?all_tenants=1' + getParameters(fields) + '&domain_id=' + domainID;
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
  manageVolume: function(data) {
    return fetch.post({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/os-volume-manage',
      data: data
    });
  },
  getVolumeType: function() {
    return fetch.get({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/types'
    }).then(res => {
      res.volume_types.unshift({
        id: 'no_volume_type',
        name: __.no_volume_type
      });
      return res.volume_types;
    });
  },
  getAvailabilityZone: function() {
    let url = '/proxy/nova/v2.1/os-availability-zone/detail';
    return fetch.get({
      url: url
    }).then((res) => {
      let zones = res.availabilityZoneInfo;
      zones.forEach(zone => {
        zone.id = zone.name = zone.zoneName;
      });

      return zones;
    });
  },
  getHostsList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/os-hypervisors/detail'
    }).then(res => {
      let hypervisors = res.hypervisors.map(hypervisor => hypervisor.hypervisor_hostname);
      return hypervisors;
    });
  }
};
