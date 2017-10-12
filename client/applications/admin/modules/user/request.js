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

    return this.getDomains().then((domains) => {
      let currentDomain = HALO.configs.domain.toLowerCase();
      let defaultid = HALO.settings.enable_ldap ? '&domain_id=default' : '';
      let domainID = domains.find((ele) => ele.name.toLowerCase() === currentDomain).id;
      let urlParam = domainID !== 'default' ? '&domain_id=' + domainID : defaultid;

      let url = '/proxy-search/keystone/v3/users?limit=' + pageLimit + urlParam;
      return fetch.get({
        url: url
      }).then((res) => {
        res._url = url;
        res.domains = domains;
        return res;
      });
    });
  },
  getFilteredList: function(data, pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    return this.getDomains().then((domains) => {
      let currentDomain = HALO.configs.domain.toLowerCase();
      let defaultid = HALO.settings.enable_ldap ? '&domain_id=default' : '';
      let domainID = domains.find((ele) => ele.name.toLowerCase() === currentDomain).id;
      let urlParam = domainID !== 'default' ? '&domain_id=' + domainID : defaultid;
      let url = '/proxy-search/keystone/v3/users?limit=' + pageLimit + requestParams(data) + (data.domain_id ? '' : urlParam);

      return fetch.get({
        url: url
      }).then((res) => {
        res._url = url;
        return res;
      });
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
  getUserByID: function(userID) {
    let url = '/proxy-search/keystone/v3/users?id=' + userID;
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
    let deferredList = [];
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
    let deferredList = [];
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
      url: '/api/v1/role_assignments?user.id=' + user.id + '&include_names=1'
    }).then((res) => {
      let domainRoles = [],
        projectRoles = [];
      res.role_assignments.forEach((r) => {
        if (r.scope.domain) {
          let domainId = r.scope.domain.id;
          let hasDomain = domainRoles.some((d) => {
            if (d.scope.domain.id === domainId) {
              return true;
            }
            return false;
          });
          if (!hasDomain) {
            domainRoles.push(r);
          }
        } else {
          let projectId = r.scope.project.id;
          let hasProject = projectRoles.some((p) => {
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
    let dRoles = {},
      pRoles = {},
      deferredList = [];
    let domainRoles = roles.domainRoles,
      projectRoles = roles.projectRoles;
    domainRoles.forEach((dr) => {
      let domainId = dr.scope.domain.id;
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/domains/' + domainId + '/users/' + dr.user.id + '/roles/'
      }));
    });
    projectRoles.forEach((pr) => {
      let projectId = pr.scope.project.id;
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/projects/' + projectId + '/users/' + pr.user.id + '/roles/'
      }));
    });
    return RSVP.all(deferredList).then((res) => {
      for (let i = 0; i < res.length; i++) {
        if (i < domainRoles.length) {
          let domainId = domainRoles[i].scope.domain.id;
          dRoles[domainId] = res[i].roles;
        } else {
          let projectName = projectRoles[i - domainRoles.length].scope.project.name;
          let projectId = projectRoles[i - domainRoles.length].scope.project.id;
          pRoles[projectName] = {};
          pRoles[projectName].id = projectId;
          pRoles[projectName].roles = res[i].roles;
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
    let deferredList = [];
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
    return this.getDomains().then((domains) => {
      let currentDomain = HALO.configs.domain.toLowerCase();
      let domainID = domains.find((ele) => ele.name.toLowerCase() === currentDomain).id;

      let deferredList = [];
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/groups?domain_id=' + domainID
      }));
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/users/' + userID + '/groups'
      }));
      return RSVP.all(deferredList).then((res) => {
        let allGroups = res[0].groups,
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
