'use strict';
const co = require('co');

const base = require('../base.js');
const paginate = require('helpers/paginate.js');
const drivers = require('drivers');
const DKS = drivers.keystone;
const userModel = require('../../models').user;

// due to User is reserved word
function User(app) {
  this.app = app;
}

User.prototype = {
  getUserList: function (req, res, next) {
    let objVar = base.getVars(req);
    co(function *() {
      const payload = yield base.__listUsersAsync(objVar);
      let query = objVar.query;
      let domainId = query.domain_id;
      let obj = paginate('users', payload.body.users, '/api/v1/users', query.page, query.limit, (domainId ? {domain_id: domainId} : null));
      res.json({
        users: obj.users,
        users_links: obj.users_links
      });
    }).catch(next);
  },
  createUser: function (req, res, next) {
    co(function *() {
      let token = req.session.user.token;
      let remote = req.session.endpoint.keystone[req.headers.region];
      let isCreateProject = req.body.is_create_project;
      let userObj = {};
      userObj.name = req.body.name;
      userObj.password = req.body.password;
      userObj.domain_id = req.body.domain_id;
      userObj.description = req.body.description;
      userObj.email = req.body.email;


      if (!isCreateProject) {
        let result;
        try {
          result = yield drivers.keystone.user.createUserAsync(token, remote, {user: userObj});
        } catch (e) {
          if (e.status === 409) {
            return res.status(409).json({error: req.i18n.__('api.keystone.duplicateUser')});
          } else {
            throw e;
          }
        }
        if (result) {
          res.send(result.body);
        }
      } else {
        let projectName = req.body.project_name;
        let role = req.body.role;
        let userQuery = {name: userObj.name};
        let settings = yield base._getSettingsByApp('global');
        let enableLdap = false;
        settings.some(s => {
          if (s.name === 'enable_ldap') {
            enableLdap = s.value;
            return true;
          }
        });
        if (enableLdap) {
          userQuery.domain_id = req.body.domain_id;
        }
        let results = yield {
          users: drivers.keystone.user.listUsersAsync(token, remote, userQuery),
          projects: drivers.keystone.project.listProjectsAsync(token, remote, {name: projectName})
        };

        if (results.users.body.users.length) {
          return res.status(404).json({error: req.i18n.__('api.keystone.duplicateUser')});
        }
        if (results.projects.body.projects.length) {
          return res.status(404).json({error: req.i18n.__('api.keystone.duplicateProject')});
        }

        let user = yield drivers.keystone.user.createUserAsync(token, remote, {user: userObj});
        let project = yield drivers.keystone.project.createProjectAsync(token, remote,
          {project: {domain_id: req.body.domain_id, name: projectName}}
        );
        user = user.body.user;
        project = project.body.project;

        yield drivers.keystone.role.addRoleToUserOnProjectAsync(project.id, user.id, role, token, remote);
        res.send({user, project});
      }
    }).catch(next);
  },
  getUser: function (req, res, next) {
    co(function *() {
      const userId = req.params.userId;
      const token = req.header('X-Auth-Token') || req.session.user.token;
      const result = yield [
        base.__getUserAsync({userId: userId, token: token}),
        userModel.findOne({where: {id: userId}})
      ];
      const user = result[0].body.user;
      user.phone = result[1] ? result[1].phone : '';
      res.send(user);
    }).catch(next);
  },
  getRoleAssignments: (req, res, next) => {
    co(function *() {
      const query = req.query;
      const domainId = query.domain_id;
      delete query.domain_id;
      Object.keys(query).forEach(key => {
        query[key] = query[key] ? query[key].trim() : '';
      });
      const token = req.session.user.token;
      const remote = req.session.endpoint.keystone[req.session.user.regionId];
      const result = yield DKS.role.roleAssignmentsAsync(token, remote, req.query);
      if (Object.prototype.hasOwnProperty.call(query, 'include_names') && query.include_names !== '0') {
        const assignments = result.body.role_assignments;
        const metadata = {domain: {}, project: {}, group: {}, role: {}, user: {}};
        const reqs = {list: {}, get: {}};
        if (query['role.id']) {
          reqs.get.role = DKS.role.getRoleAsync(token, remote, query['role.id']);
        } else {
          reqs.list.role = DKS.role.listRolesAsync(token, remote);
        }

        if (query['user.id']) {
          reqs.get.user = DKS.user.getUserAsync(token, remote, query['user.id']);
        } else if (query['group.id']) {
          reqs.get.group = DKS.group.getGroupAsync(token, remote, query['group.id']);
        } else {
          reqs.list.user = DKS.user.listUsersAsync(token, remote, domainId ? {domain_id: domainId} : {});
          reqs.list.group = DKS.group.listGroupsAsync(token, remote, domainId ? {domain_id: domainId} : {});
        }

        if (query['scope.project.id']) {
          reqs.get.project = DKS.project.getProjectAsync(token, remote, query['scope.project.id']);
        } else if (query['scope.domain.id']) {
          reqs.get.domain = DKS.domain.getDomainAsync(token, remote, query['scope.domain.id']);
        } else {
          reqs.list.project = DKS.project.listProjectsAsync(token, remote);
          reqs.list.domain = DKS.domain.listDomainsAsync(token, remote);
        }
        const results = yield reqs;
        Object.keys(results.list).forEach(key => {
          results.list[key].body[key + 's'].forEach(d => {
            metadata[key][d.id] = d;
          });
        });
        Object.keys(results.get).forEach(key => {
          metadata[key][results.get[key].body[key].id] = results.get[key].body[key];
        });
        assignments.forEach(a => {
          if (a.user && metadata.user[a.user.id]) {
            a.user.name = metadata.user[a.user.id].name;
            a.user.domain = {
              id: metadata.user[a.user.id].domain_id,
              name: metadata.domain[metadata.user[a.user.id].domain_id].name
            };
          } else if (a.group && metadata.group[a.group.id]) {
            a.group.name = metadata.group[a.group.id].name;
            a.group.domain = {
              id: metadata.group[a.group.id].domain_id,
              name: metadata.domain[metadata.group[a.group.id].domain_id].name
            };
          }
          if (a.scope.project && metadata.project[a.scope.project.id]) {
            a.scope.project.name = metadata.project[a.scope.project.id].name;
            a.scope.project.domain = {
              id: metadata.project[a.scope.project.id].domain_id,
              name: metadata.domain[metadata.project[a.scope.project.id].domain_id].name
            };
          } else if (a.scope.domain) {
            a.scope.domain.name = metadata.domain[a.scope.domain.id];
          }
          a.role.name = metadata.role[a.role.id] && metadata.role[a.role.id].name;
        });
      }
      res.send(result.body);
    }).catch(next);
  },
  initRoutes: function () {
    this.app.get('/api/v1/user/:userId', this.getUser.bind(this));
    this.app.get('/api/v1/users', this.getUserList.bind(this));
    this.app.post('/api/v1/users', this.createUser.bind(this));
    this.app.get('/api/v1/role_assignments', base.middleware.checkLogin, this.getRoleAssignments.bind(this));
  }
};

module.exports = User;
