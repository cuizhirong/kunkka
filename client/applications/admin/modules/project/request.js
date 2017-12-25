const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');

function requestParams(obj) {
  let str = '';
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

    let url = '/proxy-search/keystone/v3/projects?limit=' + pageLimit;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getProjectByID: function(projectID) {
    let url = '/proxy-search/keystone/v3/projects?id=' + projectID;
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

    let url = '/proxy-search/keystone/v3/projects?limit=' + pageLimit + requestParams(data);
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
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/projects/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  getUserIds: function(projectID) {
    let users = [];
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
    let userGrps = [];
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
    let deferredList = [];
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/roles'
    }));
    userIds.forEach((id) => {
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/users/' + id
      }));
    });
    return RSVP.all(deferredList).then((res) => {
      let users = [],
        roles = res[0].roles;
      let filterAssignment = function(assignment) {
        let role = [];
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
      for (let i = 1; i < res.length; i++) {
        res[i].user.role = filterAssignment(assignments[userIds[i - 1]]);
        users.push(res[i].user);
      }
      return users;
    });
  },
  getGrps: function(grpIds, roleMappings) {
    let deferredList = [];
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
    let _data = {};
    for(let i in data) {
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
      let domains = [];
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
    let deferredList = [];
    return this.getDomains().then((domains) => {
      let currentDomain = HALO.configs.domain;
      let defaultid = HALO.settings.enable_ldap ? '?domain_id=default' : '';
      let domainID = domains.find((ele) => ele.name === currentDomain).id;
      let urlParam = domainID !== 'default' ? '?domain_id=' + domainID : defaultid;
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
    let deferredList = [];
    roleID.forEach((id) => {
      deferredList.push(fetch.put({
        url: '/proxy/keystone/v3/projects/' + projectID + '/users/' + userID + '/roles/' + id
      }));
    });
    return RSVP.all(deferredList);
  },
  addUserGroups: function(projectID, userGroupID, roleID) {
    let deferredList = [];
    roleID.forEach((id) => {
      deferredList.push(fetch.put({
        url: '/proxy/keystone/v3/projects/' + projectID + '/groups/' + userGroupID + '/roles/' + id
      }));
    });
    return RSVP.all(deferredList);
  },
  removeUser: function(projectID, userID, roles) {
    let deferredList = [];
    roles.forEach((role) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/projects/' + projectID + '/users/' + userID + '/roles/' + role
      }));
    });
    return RSVP.all(deferredList);
  },
  getUserGroups: function() {
    return this.getDomains().then((domains) => {
      let currentDomain = HALO.configs.domain;
      let defaultid = HALO.settings.enable_ldap ? '?domain_id=default' : '';
      let domainID = domains.find((ele) => ele.name === currentDomain).id;
      let urlParam = domainID !== 'default' ? '?domain_id=' + domainID : defaultid;

      let url = '/proxy/keystone/v3/groups' + urlParam;
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
    let url = '/proxy/keystone/v3/roles';
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
      return this.getDomains().then((domains) => {
        let currentDomain = HALO.configs.domain;
        let domainID = domains.find((ele) => ele.name === currentDomain).id;
        return fetch.get({
          url: '/api/v1/users?name=' + data.value + '&domain_id=' + domainID
        });
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
    let deferredList = [];
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
    let deferredList = [];
    roles.forEach((r) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/projects/' + projectID + '/groups/' + groupID + '/roles/' + r
      }));
    });
    return RSVP.all(deferredList);
  },
  getInstanceUsage: function(projectId) {
    return fetch.get({
      url: '/proxy/nova/v2.1/os-simple-tenant-usage/' + projectId
    }).then((res) => {
      return res.tenant_usage;
    });
  },
  linkProject: (projectId) => {
    return RSVP.all([fetch.get({
      url: '/proxy/keystone/v3/roles?name=rating'
    }), fetch.get({
      url: '/proxy/keystone/v3/users?name=cloudkitty'
    })]).then((res) => {
      if(res[0].roles.length < 1 || res[1].users.length < 1) {
        return null;
      }
      let ratingId = res[0].roles[0].id;
      let userId = res[1].users[0].id;
      return fetch.put({
        url: `/proxy/keystone/v3/projects/${projectId}/users/${userId}/roles/${ratingId}`
      });
    });
  }
};
