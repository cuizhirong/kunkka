var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getListInitialize: function(pageLimit, forced) {
    var req = [];
    req.push(this.getList(pageLimit));

    return RSVP.all(req);
  },
  getGroupByIDInitialize: function(groupID, forced) {
    var req = [];
    req.push(this.getGroupByID(groupID));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/keystone/v3/groups';
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
  getGroupByID: function(groupID) {
    var url = '/proxy/keystone/v3/groups/' + groupID;
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
        url: '/proxy/keystone/v3/groups/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  getGroupRoles: function(group) {
    return fetch.get({
      url: '/proxy/keystone/v3/domains/' + group.domain_id + '/groups/' + group.id + '/roles'
    });
  },
  getUsers: function(groupID) {
    return fetch.get({
      url: '/proxy/keystone/v3/groups/' + groupID + '/users'
    });
  }
};
