var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getListInitialize: function(pageLimit, forced) {
    var req = [];
    req.push(this.getList(pageLimit));

    return RSVP.all(req);
  },
  getUserByIDInitialize: function(userID, forced) {
    var req = [];
    req.push(this.getUserByID(userID));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/keystone/v3/users';
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
  getUserByID: function(userID) {
    var url = '/proxy/keystone/v3/users/' + userID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getRelatedResource: function(userID) {
    var deferredList = [];
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/users/' + userID + '/groups'
    }));
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/users/' + userID + '/projects'
    }));
    return RSVP.all(deferredList);
  },
  deleteItem: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/users/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  }
};
