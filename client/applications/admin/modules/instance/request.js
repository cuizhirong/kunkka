var storage = require('client/applications/admin/cores/storage');
var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

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
  migrate: function(id, hostID) {
    var data = {
      'os-migrateLive': {
        'host': hostID,
        'block_migration': false,
        'disk_over_commit': false
      }
    };

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
  }
};
