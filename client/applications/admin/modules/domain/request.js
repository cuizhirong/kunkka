var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getListInitialize: function(pageLimit, forced) {
    var req = [];
    req.push(this.getList(pageLimit));

    return RSVP.all(req);
  },
  getDomainByIDInitialize: function(domainID, forced) {
    var req = [];
    req.push(this.getDomainByID(domainID));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/keystone/v3/domains?limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = '/proxy/keystone/v3/' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getDomainByID: function(domainID) {
    var url = '/proxy/keystone/v3/domains/' + domainID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  deleteItem: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/domains/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  editDomain: function(domainID, data) {
    return fetch.patch({
      url: '/proxy/keystone/v3/domains/' + domainID,
      data: {
        domain: data
      }
    });
  }
};
