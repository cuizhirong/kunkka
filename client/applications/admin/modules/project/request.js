var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getListInitialize: function(pageLimit, forced) {
    var req = [];
    req.push(this.getList(pageLimit));

    return RSVP.all(req);
  },
  getProjectByIDInitialize: function(projectID, forced) {
    var req = [];
    req.push(this.getProjectByID(projectID));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/keystone/v3/projects';
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
  getProjectByID: function(projectID) {
    var url = '/proxy/keystone/v3/projects/' + projectID;
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
        url: '/proxy/keystone/v3/projects/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  getUserIds: function(projectID) {
    var users = [];
    return fetch.get({
      url: '/proxy/keystone/v3/role_assignments?scope.project.id=' + projectID
    }).then((res) => {
      res.role_assignments.forEach((role) => {
        users.push(role.user.id);
      });
      return users;
    });
  },
  getUsers: function(userIds) {
    var deferredList = [];
    userIds.forEach((id) => {
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/users/' + id
      }));
    });
    return RSVP.all(deferredList);
  },
  getOverview: function(projectID) {
    return fetch.get({
      url: '/api/v1/' + projectID + '/overview'
    });
  }
};
