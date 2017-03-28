var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

function requestParams(obj) {
  var str = '';
  for(let key in obj) {
    if(key === 'name') {
      str += ('&search=' + obj[key]);
    } else {
      str += ('&' + key + '=' + obj[key]);
    }
  }

  return str;
}

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy-search/keystone/v3/projects?limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getProjectByID: function(projectID) {
    var url = '/proxy-search/keystone/v3/projects?id=' + projectID;
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
  getFilteredList: function(data, pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy-search/keystone/v3/projects?limit=' + pageLimit + requestParams(data);
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
      return res;
    }).catch((res) => {
      res._url = nextUrl;
      return res;
    });
  },
  getProjects: function() {
    return fetch.get({
      url: '/api/v1/projects'
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
        if (role.user) {
          users.push(role);
        }
      });
      return users;
    });
  },
  getUserGrpIds: function(projectID) {
    var userGrps = [];
    return fetch.get({
      url: '/proxy/keystone/v3/role_assignments?scope.project.id=' + projectID
    }).then((res) => {
      res.role_assignments.forEach((role) => {
        if (role.group) {
          userGrps.push(role);
        }
      });

      let grps = [],
        roleMapping = {};

      userGrps.forEach(ele => {
        let id = ele.group.id,
          roleID = ele.role.id;
        if(!roleMapping[id]) {
          roleMapping[id] = []; //init mapping group
          grps.push(id); //clean duplicated group in userGrps
        }
        roleMapping[id].push(roleID);//record role
      });

      return {grps, roleMapping};
    });
  },
  addRole: function (domainID, userID, roleID) {
    return fetch.put({
      url: '/proxy/keystone/v3/projects/' + domainID + '/users/' + userID + '/roles/' + roleID
    });
  },
  getUsers: function(userIds, assignments) {
    var deferredList = [];
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/roles'
    }));
    userIds.forEach((id) => {
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/users/' + id
      }));
    });
    return RSVP.all(deferredList).then((res) => {
      var users = [],
        roles = res[0].roles;
      var filterAssignment = function(assignment) {
        var role = [];
        assignment.forEach((a) => {
          roles.some((r) => {
            if (r.id === a) {
              role.push(r);
              return true;
            }
            return false;
          });
        });
        return role;
      };
      for (var i = 1; i < res.length; i++) {
        res[i].user.role = filterAssignment(assignments[userIds[i - 1]]);
        users.push(res[i].user);
      }
      return users;
    });
  },
  getGrps: function(grpIds, roleMappings) {
    var deferredList = [];
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/roles'
    }));
    grpIds.forEach(id => {
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/groups/' + id
      }));
    });

    return RSVP.all(deferredList).then(res => {
      let roles = res[0].roles,
        groups = [];

      res.forEach(ele => {
        if(ele.group) {
          groups.push(ele.group);
        }
      });

      groups.forEach(grp => {//add roles data in each group
        grp.roles = [];
        roleMappings[grp.id].forEach(roleID => {
          roles.some(r => {
            if(r.id === roleID) {
              grp.roles.push(r);
              return true;
            }
            return false;
          });
        });
      });

      return groups;
    });
  },
  getQuotas: function(projectID) {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/overview?all_tenants=1&tenant_id=' + projectID
    });
  },
  modifyQuota: function(data, projectID) {
    var _data = {};
    for(var i in data) {
      _data[i] = data[i].total;
    }
    return fetch.put({
      url: '/api/v1/' + HALO.user.projectId + '/quota/' + projectID,
      data: _data
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
  editProject: function(projectID, data) {
    return fetch.patch({
      url: '/proxy/keystone/v3/projects/' + projectID,
      data: {
        project: data
      }
    });
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
  getAllUsers: function() {
    var deferredList = [];
    return this.getDomains().then((domains) => {
      var currentDomain = HALO.configs.domain;
      var defaultid = HALO.settings.enable_ldap ? '?domain_id=default' : '';
      var domainID = domains.find((ele) => ele.name === currentDomain).id;
      var urlParam = domainID !== 'default' ? '?domain_id=' + domainID : defaultid;
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/users' + urlParam
      }));
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/roles'
      }));
      return RSVP.all(deferredList);
    });
  },
  addUser: function(projectID, userID, roleID) {
    var deferredList = [];
    roleID.forEach((id) => {
      deferredList.push(fetch.put({
        url: '/proxy/keystone/v3/projects/' + projectID + '/users/' + userID + '/roles/' + id
      }));
    });
    return RSVP.all(deferredList);
  },
  addUserGroups: function(projectID, userGroupID, roleID) {
    var deferredList = [];
    roleID.forEach((id) => {
      deferredList.push(fetch.put({
        url: '/proxy/keystone/v3/projects/' + projectID + '/groups/' + userGroupID + '/roles/' + id
      }));
    });
    return RSVP.all(deferredList);
  },
  removeUser: function(projectID, userID, roles) {
    var deferredList = [];
    roles.forEach((role) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/projects/' + projectID + '/users/' + userID + '/roles/' + role
      }));
    });
    return RSVP.all(deferredList);
  },
  getUserGroups: function() {
    return this.getDomains().then((domains) => {
      var currentDomain = HALO.configs.domain;
      var defaultid = HALO.settings.enable_ldap ? '?domain_id=default' : '';
      var domainID = domains.find((ele) => ele.name === currentDomain).id;
      var urlParam = domainID !== 'default' ? '?domain_id=' + domainID : defaultid;

      var url = '/proxy/keystone/v3/groups' + urlParam;
      return fetch.get({
        url: url
      }).then((res) => {
        res._url = url;
        res.domains = domains;
        return res;
      });
    });
  },
  getAllRoles: function() {
    var url = '/proxy/keystone/v3/roles';
    return fetch.get({
      url: url
    });
  },
  getUserGroupsAndRoles: function() {
    let requestList = [];
    requestList.push(this.getUserGroups());
    requestList.push(this.getAllRoles());
    return RSVP.all(requestList);
  },
  // check if user name or id is available
  queryUserId: function(data) {
    if(data.type === 'name') {
      return fetch.get({
        url: '/api/v1/users?name=' + data.value
      });
    } else if(data.type === 'id') {
      return fetch.get({
        url: '/proxy/keystone/v3/users/' + data.value
      });
    } else {
      return null;
    }
  },
  addUserAndUserGroup(projectID, users, groups) {
    let requestList = [];
    let that = this;
    if(users && users.length > 0) {
      users.forEach((user) => {
        requestList.push(that.addUser(projectID, user.id, user.roleIDs));
      });
    }
    if(groups && groups.length > 0) {
      groups.forEach((group) => {
        requestList.push(that.addUserGroups(projectID, group.id, group.roleIDs));
      });
    }
    return RSVP.all(requestList);
  },
  addUserGroup: function(projectID, groupID, roleID) {
    var deferredList = [];
    roleID.forEach((id) => {
      deferredList.push(fetch.put({
        url: '/proxy/keystone/v3/projects/' + projectID + '/groups/' + groupID + '/roles/' + id
      }));
    });
    return RSVP.all(deferredList);
  },
  getRoles: function(group) {
    return fetch.get({
      url: '/proxy/keystone/v3/roles'
    });
  },
  removeUserGroup: function(projectID, groupID, roles) {
    var deferredList = [];
    roles.forEach((r) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/projects/' + projectID + '/groups/' + groupID + '/roles/' + r
      }));
    });
    return RSVP.all(deferredList);
  }
};
