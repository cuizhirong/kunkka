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
      let currentDomain = HALO.configs.domain;
      let defaultid = HALO.settings.enable_ldap ? '&domain_id=default' : '';
      let domainID = domains.find((ele) => ele.name === currentDomain).id;
      let urlParam = domainID !== 'default' ? '&domain_id=' + domainID : defaultid;

      let url = '/proxy-search/keystone/v3/groups?limit=' + pageLimit + urlParam;
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
      let currentDomain = HALO.configs.domain;
      let defaultid = HALO.settings.enable_ldap ? '&domain_id=default' : '';
      let domainID = domains.find((ele) => ele.name === currentDomain).id;
      let urlParam = domainID !== 'default' ? '&domain_id=' + domainID : defaultid;
      let url = '/proxy-search/keystone/v3/groups?limit=' + pageLimit + requestParams(data) + (data.domain_id ? '' : urlParam);

      return fetch.get({
        url: url
      }).then((res) => {
        res._url = url;
        return res;
      });
    });
  },
  getNextList: function(nextUrl) {
    let url = nextUrl;
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
    let url = '/proxy-search/keystone/v3/groups?id=' + groupID;
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
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/groups/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  getRoleAssignments: function(group) {
    return fetch.get({
      url: '/api/v1/role_assignments?group.id=' + group.id + '&include_names=1'
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
  getGroupRoles: function(roles) {
    let dRoles = {},
      pRoles = {},
      deferredList = [];
    let domainRoles = roles.domainRoles,
      projectRoles = roles.projectRoles;
    domainRoles.forEach((dr) => {
      let domainId = dr.scope.domain.id;
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/domains/' + domainId + '/groups/' + dr.group.id + '/roles/'
      }));
    });
    projectRoles.forEach((pr) => {
      let projectId = pr.scope.project.id;
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/projects/' + projectId + '/groups/' + pr.group.id + '/roles/'
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
    let deferredList = [];
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
    let deferredList = [];
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
      let domains = [];
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
