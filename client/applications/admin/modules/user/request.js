var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

function requestParams(obj) {
  var str = '';
  for(let key in obj) {
    str += ('&' + key + '=' + obj[key]);
  }

  return str;
}

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    return this.getDomains().then((domains) => {
      var currentDomain = HALO.configs.domain.toLowerCase();
      var domainID = domains.find((ele) => ele.name.toLowerCase() === currentDomain).id;
      var urlParam = domainID !== 'default' ? '&domain_id=' + domainID : '';

      var url = '/api/v1/users?limit=' + pageLimit + urlParam;
      return fetch.get({
        url: url
      }).then((res) => {
        res._url = url;
        return this.getCharge().then((charges) => {
          res.users.map((user) => {
            charges.accounts.map((account) => {
              if (account.user_id === user.id) {
                user.balance = account.balance;
                return true;
              }
              return false;
            });
            return res;
          });
          return res;
        });
      });
    });
  },
  getFilteredList: function(data, pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/api/v1/users?limit=' + pageLimit + requestParams(data);
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    return fetch.get({
      url: nextUrl
    }).then((res) => {
      res._url = nextUrl;
      return this.getCharge().then((charges) => {
        res.users.map((user) => {
          charges.accounts.map((account) => {
            if (account.user_id === user.id) {
              user.balance = account.balance;
              return true;
            }
            return false;
          });
          return res;
        });
        return res;
      });
    }).catch((res) => {
      res._url = nextUrl;
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
    }).catch((res) => {
      res._url = url;
      return res;
    });
  },
  getUsers: function() {
    return fetch.get({
      url: '/api/v1/users'
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
  getDomains: function() {
    return fetch.get({
      url: '/proxy/keystone/v3/domains'
    }).then((res) => {
      var domains = [];
      res.domains.forEach((domain) => {
        if (domain.id === 'default') {
          domains.unshift(domain);
        } else {
          domains.push(domain);
        }
      });

      return domains;
    });
  },
  createProject: function(data) {
    return fetch.post({
      url: '/proxy/keystone/v3/projects',
      data: {
        project: data
      }
    });
  },
  getRoles: function() {
    return fetch.get({
      url: '/proxy/keystone/v3/roles'
    }).then((res) => {
      return res.roles;
    });
  },
  deleteItem: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/users/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createUser: function(data) {
    return fetch.post({
      url: '/api/v1/users',
      data: data
    });
  },
  editUser: function(userID, data) {
    return fetch.patch({
      url: '/proxy/keystone/v3/users/' + userID,
      data: {
        user: data
      }
    });
  },
  getRoleAssignments: function(user) {
    return fetch.get({
      url: '/proxy/keystone/v3/role_assignments?user.id=' + user.id
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
  getUserRoles: function(roles) {
    var dRoles = {},
      pRoles = {},
      deferredList = [];
    var domainRoles = roles.domainRoles,
      projectRoles = roles.projectRoles;
    domainRoles.forEach((dr) => {
      var domainId = dr.scope.domain.id;
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/domains/' + domainId + '/users/' + dr.user.id + '/roles/'
      }));
    });
    projectRoles.forEach((pr) => {
      var projectId = pr.scope.project.id;
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/projects/' + projectId + '/users/' + pr.user.id + '/roles/'
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
  addRole: function(type, user, roleID, domainID) {
    if (type === 'domain') {
      return fetch.put({
        url: '/proxy/keystone/v3/domains/' + domainID + '/users/' + user.id + '/roles/' + roleID
      });
    } else {
      return fetch.put({
        url: '/proxy/keystone/v3/projects/' + domainID + '/users/' + user.id + '/roles/' + roleID
      });
    }
  },
  removeRole: function(type, userID, roles, domainID) {
    var deferredList = [];
    if (type === 'domain') {
      roles.forEach((r) => {
        deferredList.push(fetch.delete({
          url: '/proxy/keystone/v3/domains/' + domainID + '/users/' + userID + '/roles/' + r
        }));
      });
    } else {
      roles.forEach((r) => {
        deferredList.push(fetch.delete({
          url: '/proxy/keystone/v3/projects/' + domainID + '/users/' + userID + '/roles/' + r
        }));
      });
    }
    return RSVP.all(deferredList);
  },
  getGroups: function(userID) {
    var deferredList = [];
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/groups'
    }));
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/users/' + userID + '/groups'
    }));
    return RSVP.all(deferredList).then((res) => {
      var allGroups = res[0].groups,
        joinedGroups = res[1].groups;
      joinedGroups.forEach((i) => {
        allGroups.some((j) => {
          if (i.id === j.id) {
            j.disabled = true;
            return true;
          }
          return false;
        });
      });
      return allGroups;
    });
  },
  joinGroup: function(userID, groupID) {
    return fetch.put({
      url: '/proxy/keystone/v3/groups/' + groupID + '/users/' + userID
    });
  },
  leaveGroup: function(userID, groupID) {
    return fetch.delete({
      url: '/proxy/keystone/v3/groups/' + groupID + '/users/' + userID
    });
  },
  charge: function(id, data) {
    return fetch.put({
      url: '/proxy/gringotts/v2/accounts/' + id,
      data: data
    });
  },
  getChargeById: function(id) {
    return fetch.get({
      url: '/proxy/gringotts/v2/accounts/' + id
    });
  },
  getCharge: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/accounts/'
    });
  }
};
