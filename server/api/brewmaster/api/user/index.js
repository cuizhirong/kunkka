'use strict';
const co = require('co');

const base = require('../base.js');
const paginate = require('helpers/paginate.js');
const drivers = require('drivers');
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
        if (results.users.body.projects.length) {
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
  initRoutes: function () {
    this.app.get('/api/v1/user/:userId', this.getUser.bind(this));
    this.app.get('/api/v1/users', this.getUserList.bind(this));
    this.app.post('/api/v1/users', this.createUser.bind(this));
  }
};

module.exports = User;
