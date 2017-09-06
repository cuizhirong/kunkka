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
  getSnapshotByID: function(snapshotID) {
    var url = '/proxy-search/cinder/v2/' + HALO.user.projectId + '/snapshots/detail?all_tenants=1&id=' + snapshotID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getList: function(pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy-search/cinder/v2/' + HALO.user.projectId + '/snapshots/detail?all_tenants=1&limit=' + pageLimit;
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

    var url = '/proxy-search/cinder/v2/' + HALO.user.projectId + '/snapshots/detail?all_tenants=1&limit=' + pageLimit + getParameters(data);
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  filterFromAll: function(data, pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    function requestParams(obj) {
      var str = '';
      for(let key in obj) {
        if(key === 'name') {
          str += ('&search=' + obj[key]);
        } else {
          str += ('&' + key + '=' + obj[key]);
        }
      }

      return str;
    }

    var url = '/proxy-search/cinder/v2/' + HALO.user.projectId + '/snapshots/detail?all_tenants=1&limit=' + pageLimit + requestParams(data);
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
  },
  getFieldsList: function() {
    return fetch.get({
      url: '/proxy/csv-field/snapshots'
    });
  },
  exportCSV(fields) {
    let url = '/proxy/csv/cinder/v2/' + HALO.user.projectId + '/snapshots/detail?all_tenants=1' + getParameters(fields);
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
