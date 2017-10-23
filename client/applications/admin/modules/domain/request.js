const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/proxy/keystone/v3/domains?limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    let url = '/proxy/keystone/v3/' + nextUrl;
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
  getDomainByID: function(domainID) {
    let url = '/proxy/keystone/v3/domains/' + domainID;
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
  deleteItem: function(items) {
    let deferredList = [];
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
