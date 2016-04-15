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
  },
  createGroup: function(data) {
    return fetch.post({
      url: '/proxy/keystone/v3/groups',
      data: {
        group: data
      }
    });
  },
  editGroup: function(groupID, data) {
    return fetch.patch({
      url: '/proxy/keystone/v3/groups/' + groupID,
      data: {
        group: data
      }
    });
  },
  getRoles: function(group) {
    var deferredList = [];
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/roles'
    }));
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/domains/' + group.domain_id + '/groups/' + group.id + '/roles'
    }));
    return RSVP.all(deferredList);
  },
  addRole: function(group, roleID) {
    return fetch.put({
      url: '/proxy/keystone/v3/domains/' + group.domain_id + '/groups/' + group.id + '/roles/' + roleID
    });
  },
  removeRole: function(group, roleID) {
    return fetch.delete({
      url: '/proxy/keystone/v3/domains/' + group.domain_id + '/groups/' + group.id + '/roles/' + roleID
    });
  },
  getAllUsers: function(groupID) {
    var deferredList = [];
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/groups/' + groupID + '/users'
    }));
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/users'
    }));
    return RSVP.all(deferredList);
  },
  addUser: function(groupID, users) {
    var deferredList = [];
    users.forEach((user) => {
      deferredList.push(fetch.put({
        url: '/proxy/keystone/v3/groups/' + groupID + '/users/' + user.id
      }));
    });
    return RSVP.all(deferredList);
  },
  removeUser: function(groupID, userID) {
    return fetch.delete({
      url: '/proxy/keystone/v3/groups/' + groupID + '/users/' + userID
    });
  }
};
