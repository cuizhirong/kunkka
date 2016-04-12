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
  getVolumeByIDInitialize: function(volumeID, forced) {
    var req = [];
    req.push(this.getVolumeByID(volumeID));
    req.push(this.getFilterOptions(forced));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if (isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/detail?all_tenants=1&limit=' + pageLimit;
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
  getVolumeByID: function(volumeID) {
    var url = '/proxy/cinder/v2/' + HALO.user.projectId + '/volumes/' + volumeID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  }
};
