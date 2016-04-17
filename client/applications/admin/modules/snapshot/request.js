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
  getSnapshotByIDInitialize: function(snapshotID, forced) {
    var req = [];
    req.push(this.getSnapshotByID(snapshotID));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots/detail?all_tenants=1&limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = '/proxy/cinder/v2/' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getVolumeById: function(volumeID) {
    var url = '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + volumeID;
    return fetch.get({
      url: url
    });
  },
  getSnapshotByID: function(snapshotID) {
    var url = '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots/' + snapshotID;
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

    var url = '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots/detail?all_tenants=1' + requestParams(data);
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  editSnapshotName: function(item, newName) {
    var data = {};
    data.snapshot = {};
    data.snapshot.name = newName;

    return fetch.put({
      url: '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots/' + item.id,
      data: data
    });
  },
  deleteSnapshots: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/cinder/v2/' + HALO.user.projectId + '/snapshots/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  }
};
