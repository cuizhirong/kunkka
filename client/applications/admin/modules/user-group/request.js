var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
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
    }).catch((res) => {
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
    }).catch((res) => {
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
    }).catch((res) => {
      res._url = url;
      return res;
    });
  },
  getGroups: function(name) {
    return fetch.get({
      url: '/proxy/keystone/v3/groups'
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
  getRoleAssignments: function(group) {
    return fetch.get({
      url: '/proxy/keystone/v3/role_assignments?group.id=' + group.id
    }).then((res) => {
      var domainRoles = [],
        projectRoles = [];
      res.role_assignments.forEach((r) => {
        if (r.scope.domain) {
          var domainId = r.scope.domain.id;
          var hasDomain = domainRoles.some((d) => {
            if (d.scope.domain.id === domainId) {
              return true;
            }
            return false;
          });
          if (!hasDomain) {
            domainRoles.push(r);
          }
        } else {
          var projectId = r.scope.project.id;
          var hasProject = projectRoles.some((p) => {
            if (p.scope.project.id === projectId) {
              return true;
            }
            return false;
          });
          if (!hasProject) {
            projectRoles.push(r);
          }
        }
      });
      return {
        domainRoles: domainRoles,
        projectRoles: projectRoles
      };
    });
  },
  getGroupRoles: function(roles) {
    var dRoles = {},
      pRoles = {},
      deferredList = [];
    var domainRoles = roles.domainRoles,
      projectRoles = roles.projectRoles;
    domainRoles.forEach((dr) => {
      var domainId = dr.scope.domain.id;
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/domains/' + domainId + '/groups/' + dr.group.id + '/roles/'
      }));
    });
    projectRoles.forEach((pr) => {
      var projectId = pr.scope.project.id;
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/projects/' + projectId + '/groups/' + pr.group.id + '/roles/'
      }));
    });
    return RSVP.all(deferredList).then((res) => {
      for (var i = 0; i < res.length; i++) {
        if (i < domainRoles.length) {
          var domainId = domainRoles[i].scope.domain.id;
          dRoles[domainId] = res[i].roles;
        } else {
          var projectId = projectRoles[i - domainRoles.length].scope.project.id;
          pRoles[projectId] = res[i].roles;
        }
      }
      return {
        domainRoles: dRoles,
        projectRoles: pRoles
      };
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
    return fetch.get({
      url: '/proxy/keystone/v3/roles'
    });
  },
  addRole: function(type, group, roleID, domainID) {
    if (type === 'domain') {
      return fetch.put({
        url: '/proxy/keystone/v3/domains/' + domainID + '/groups/' + group.id + '/roles/' + roleID
      });
    } else {
      return fetch.put({
        url: '/proxy/keystone/v3/projects/' + domainID + '/groups/' + group.id + '/roles/' + roleID
      });
    }
  },
  removeRole: function(type, groupID, roles, domainID) {
    var deferredList = [];
    if (type === 'domain') {
      roles.forEach((r) => {
        deferredList.push(fetch.delete({
          url: '/proxy/keystone/v3/domains/' + domainID + '/groups/' + groupID + '/roles/' + r
        }));
      });
    } else {
      roles.forEach((r) => {
        deferredList.push(fetch.delete({
          url: '/proxy/keystone/v3/projects/' + domainID + '/groups/' + groupID + '/roles/' + r
        }));
      });
    }
    return RSVP.all(deferredList);
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
  addUser: function(groupID, userID) {
    return fetch.put({
      url: '/proxy/keystone/v3/groups/' + groupID + '/users/' + userID
    });
  },
  removeUser: function(groupID, userID) {
    return fetch.delete({
      url: '/proxy/keystone/v3/groups/' + groupID + '/users/' + userID
    });
  },
  getDomains: function() {
    return fetch.get({
      url: '/proxy/keystone/v3/domains'
    }).then((res) => {
      var domains = [];
      res.domains.forEach((domain) => {
        if (domain.id === 'defult') {
          domain.unshift(domain);
        } else {
          domains.push(domain);
        }
      });
      return domains;
    });
  }
};
