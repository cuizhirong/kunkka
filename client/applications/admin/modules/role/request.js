var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getListInitialize: function(pageLimit, forced) {
    var req = [];
    req.push(this.getList(pageLimit));

    return RSVP.all(req);
  },
  getRoleByIDInitialize: function(roleID, forced) {
    var req = [];
    req.push(this.getRoleByID(roleID));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/keystone/v3/roles';
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
  getRoleByID: function(roleID) {
    var url = '/proxy/keystone/v3/roles/' + roleID;
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
        url: '/proxy/keystone/v3/roles/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createRole: function(data) {
    return fetch.post({
      url: '/proxy/keystone/v3/roles',
      data: {
        role: data
      }
    });
  },
  editRole: function(roleID, data) {
    return fetch.patch({
      url: '/proxy/keystone/v3/roles/' + roleID,
      data: {
        role: data
      }
    });
  }
};
