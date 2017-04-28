'use strict';

const co = require('co');

const userModel = require('../../models').user;
const drivers = require('drivers');
const base = require('../base');
const config = require('config');
const keystoneRemote = config('keystone');

function Sub(app) {
  this.app = app;
  this.memClient = app.get('CacheClient');

  this.operation = {
    role: {
      add: drivers.keystone.role.addRoleToUserOnProjectAsync,
      remove: drivers.keystone.role.removeRoleToUserOnProjectAsync,
      list: drivers.keystone.role.listRolesAsync,
      listAssignment: drivers.keystone.role.roleAssignmentsAsync
    },
    project: {
      create: drivers.keystone.project.createProjectAsync,
      update: drivers.keystone.project.updateProjectAsync,
      del: drivers.keystone.project.deleteProjectAsync,
      list: drivers.keystone.project.getUserProjectsAsync,
      get: drivers.keystone.project.getProjectAsync
    },
    user: {
      create: drivers.keystone.user.createUserAsync,
      update: drivers.keystone.user.updateUserAsync,
      del: drivers.keystone.user.delUserAsync,
      list: drivers.keystone.user.listUsersAsync,
      get: drivers.keystone.user.getUserAsync
    },
    email: {
      send: drivers.kiki.email.sendEmailAsync
    }
  };
}


Sub.prototype = {
  initRoutes: function () {
    this.app.get(
      '/auth/sub/account/enable',
      base.middleware.adminLogin,
      this.pageEnable.bind(this),
      base.middleware.customResPage
    );

    this.app.post(
      '/auth/sub/account/enable',
      base.middleware.adminLogin,
      this.enableAccount.bind(this),
      base.middleware.customResPage
    );
    this.app.use('/api/sub/*', base.middleware.checkLogin, this.checkSession.bind(this));

    this.app.post('/api/sub/account', this.createAccount.bind(this));

    this.app.put('/api/sub/account/:userId', this.updateAccount.bind(this));
    this.app.delete('/api/sub/account/:userId', this.delAccount.bind(this));
    this.app.get('/api/sub/account', this.getAccountList.bind(this));
    this.app.get('/api/sub/account/:userId', this.getAccount.bind(this));

    this.app.put('/api/sub/account/:userId/enable', this.setAccountEnabled.bind(this));
    this.app.put('/api/sub/account/:userId/disable', this.setAccountEnabled.bind(this));

    this.app.post('/api/sub/project', this.createProject.bind(this));
    this.app.put('/api/sub/project/:projectId', this.updateProject.bind(this));
    this.app.delete('/api/sub/project/:projectId', this.delProject.bind(this));
    this.app.get('/api/sub/project', this.getProjectList.bind(this));
    this.app.get('/api/sub/project/:projectId', this.getProject.bind(this));
    this.app.get('/api/sub/project/:projectId/users', this.getProjectUsers.bind(this));

    //this.app.put('/api/sub/projects/:projectId/users/:userId/roles/:roleId', this.addRole.bind(this));
    //this.app.delete('/api/sub/projects/:projectId/users/:userId/roles/:roleId', this.removeRole.bind(this));

    this.app.put('/api/sub/projects/:projectId/users/:userId/role-project_admin', this.addRoleProjectAdmin.bind(this));
    this.app.delete('/api/sub/projects/:projectId/users/:userId/role-project_admin', this.removeRoleProjectAdmin.bind(this));

    this.app.put('/api/sub/projects/:projectId/users/:userId/role-billing_owner', this.changeRoleBillingOwner.bind(this));
    this.app.use('/api/sub/*', base.middleware.customResApi);
  },

  checkSession: function (req, res, next) {
    const that = this;
    co(function *() {
      if (!req.session.user.defaultProjectId) {
        const userRes = yield that.operation.user.get(
          req.session.user.token,
          keystoneRemote,
          req.session.user.userId
        );
        req.session.user.defaultProjectId = userRes.body.user.default_project_id;
        if (!req.session.user.defaultProjectId) {
          return res.status(400).send({error: req.i18n.__('api.register.noDefaultProject')});
        }
        next();
      } else {
        next();
      }
    }).catch(next);
  },

  createAccount: function (req, res, next) {
    const that = this;
    const __ = req.i18n.__.bind(req.i18n);
    const token = req.session.user.token;
    const defaultProjectId = req.session.user.defaultProjectId;
    let domainId;
    req.session.user.projects.some(project => {
      return (project.id === defaultProjectId) && (domainId = project.domain_id);
    });

    const userObj = {};
    userObj.name = req.body.name;
    userObj.email = req.body.email;
    userObj.domain_id = domainId;
    userObj.default_project_id = defaultProjectId;
    userObj.enabled = false;

    co(function *() {

      let exist = yield {
        name: base.func.verifyUserByNameAsync(token, userObj.name),
        email: base.func.verifyUserAsync(token, {email: userObj.email})
      };

      let arrExist = [];
      if (exist.name) {
        arrExist.push('Name');
      }
      if (exist.email) {
        arrExist.push('Email');
      }
      if (arrExist.length) {
        return next({
          customRes: true, status: 400,
          error: arrExist.map((param) => {
            return __('api.register.' + param);
          }) + ' ' + __('api.register.Used')
        });
      }

      let user = yield that.operation.user.create(token, keystoneRemote, {user: userObj});
      user = user.body.user;
      user.links = JSON.stringify(user.links);
      user.full_name = req.body.full_name;
      user.company = req.body.company;
      yield userModel.create(user);

      let roles = yield that.operation.role.list(token, keystoneRemote, {name: 'project_member'});
      const projectMemberId = roles.body.roles[0] && roles.body.roles[0].id;
      yield that.operation.role.add(
        req.session.user.defaultProjectId,
        user.id,
        projectMemberId,
        token,
        keystoneRemote
      );

      const emailToken = yield base.func.emailTokenMemAsync(user, that.memClient);
      const href = `${req.protocol}://${req.hostname}/auth/sub/account/enable?user=${user.id}&token=${emailToken}`;
      const kikiRemote = req.session.endpoint.kiki[req.session.user.regionId];
      yield that.operation.email.send(
        user.email,
        __('api.register.UserEnable'),
        `
        <p><a href="${href}">${__('api.register.clickHereToEnableYourAccount')}</a></p>
        <p>${__('api.register.LinkFailedCopyTheHref')}</p>
        <p>${href}</p>
        `,
        kikiRemote,
        token
      );

      res.send(user);
    }).catch(next);
  },

  pageEnable: function (req, res, next) {
    const that = this;
    const adminToken = req.admin.token;
    const token = req.query.token;
    const id = req.query.user;

    co(function *() {
      let user = yield base.func.verifyUserByIdAsync(adminToken, id);
      if (!user) {
        return next({customRes: true, status: 404, msg: 'UserNotExist'});
      } else if (user.enabled) {
        return next({customRes: true, status: 400, msg: 'Enabled'});
      }
      const tokenOK = yield base.func.verifyKeyValueAsync(id, token, that.memClient);
      if (!tokenOK) {
        return next({customRes: true, status: 400, msg: 'LinkError'});
      }
      next({customRes: true, code: 200, view: 'setPwd'});
    }).catch(next);
  },

  enableAccount: function (req, res, next) {
    const that = this;
    let adminToken = req.admin.token;
    let id = req.body.user;
    let token = req.body.token;
    let phone = req.body.phone;
    let code = parseInt(req.body.captcha, 10);
    let password = req.body.pwd;

    co(function *() {
      const tokenVerify = yield base.func.verifyKeyValueAsync(id, token, that.memClient);
      if (!tokenVerify) {
        return next({status: 400, customRes: true, msg: 'TokenError'});
      }
      const codeVerify = yield base.func.verifyKeyValueAsync(phone, code, that.memClient);
      if (!codeVerify) {
        return Promise.reject({status: 400, customRes: true, msg: 'CodeError'});
      }

      let userKeystone = yield that.operation.user.update(
        adminToken,
        keystoneRemote,
        id,
        {user: {enabled: true, password: password}}
      );

      const userDB = yield userModel.find({where: {id}});

      if (!userDB) {
        userKeystone = userKeystone.body.user;
        userKeystone.links = JSON.stringify(userKeystone.links);
        userKeystone.phone = phone;
        yield userModel.create(userKeystone);
      } else {
        userDB.phone = phone;
        userDB.enabled = true;
        yield userDB.save();
      }

      next({status: 200, customRes: true, msg: 'EnableSuccess'});
    }).catch(next);
  },

  updateAccount: function (req, res, next) {
    co(function *() {
      const userId = req.params.userId;
      const user = yield userModel.findOne({where: {id: userId}});
      user.full_name = req.body.full_name || user.full_name;
      user.company = req.body.company || user.company;
      res.send(yield user.save());
    }).catch(next);
  },


  delAccount: function (req, res, next) {
    if (req.params.userId === req.session.user.userId) {
      return next({customRes: true, status: 403, msg: 'cannotDeleteYourself'});
    }

    const that = this;
    co(function *() {
      yield [
        that.operation.user.del(
          req.session.user.token,
          keystoneRemote,
          req.params.userId
        ),
        userModel.destroy({
          where: {id: req.params.userId}, force: true
        })
      ];
      res.status(204).end();
    }).catch(next);
  },

  getAccount: function (req, res, next) {
    const that = this;
    const userId = req.params.userId;
    co(function *() {
      let userRes = yield [
        that.operation.user.get(
          req.session.user.token,
          keystoneRemote,
          userId
        ),
        userModel.findOne({where: {id: userId}})
      ];
      const userKeystone = userRes[0].body.user;
      const userDB = userRes[1];
      if (userDB) {
        userKeystone.full_name = userDB.full_name;
        userKeystone.company = userDB.company;
        userKeystone.phone = userDB.phone;
      } else {
        userKeystone.full_name = userKeystone.company = userKeystone.phone = '';
        userKeystone.links = JSON.stringify(userKeystone.links);
        yield userModel.create(userKeystone);
        userKeystone.links = JSON.parse(userKeystone.links);
      }

      res.send(userKeystone);
    }).catch(next);
  },
  getAccountList: function (req, res, next) {
    const that = this;
    co(function *() {
      let assignments = yield that.operation.role.listAssignment(
        req.session.user.token,
        keystoneRemote,
        {'scope.project.id': req.session.user.defaultProjectId}
      );
      assignments = assignments.body.role_assignments;
      let userIds = new Set();
      assignments.map(assignment => {
        return assignment.user.id;
      }).map(id => userIds.add(id));
      userIds = Array.from(userIds);

      let userKeystone = userIds.map(id => that.operation.user.get(req.session.user.token, keystoneRemote, id));
      let userDB = userIds.map(id => userModel.findOne({where: {id: id}}));
      const arrUser = yield userKeystone.concat(userDB);

      userKeystone = arrUser.splice(0, userKeystone.length).map(userRes => userRes.body.user);
      userDB = arrUser.map(user => user && user.toJSON());
      userKeystone.forEach((user, i) => {
        if (!userDB[i]) {
          let tmp = JSON.parse(JSON.stringify(user));
          tmp.links = JSON.stringify(tmp.links);
          user.phone = user.company = user.full_name = '';
          userModel.create(tmp);
        } else {
          user.phone = userDB[i].phone;
          user.company = userDB[i].company;
          user.full_name = userDB[i].full_name;
        }
      });
      res.send(userKeystone);
    }).catch(next);
  },
  setAccountEnabled: function (req, res, next) {
    const that = this;
    if (req.params.userId === req.session.user.userId) {
      return next({customRes: true, status: 403, msg: 'cannotDisableYourself'});
    }
    let arr = req.path.split('/'), enabled;
    if (arr[arr.length - 1] === 'enable') {
      enabled = true;
    } else if (arr[arr.length - 1] === 'disable') {
      enabled = false;
    } else {
      next();
    }
    co(function *() {
      yield [
        that.operation.user.update(
          req.session.user.token,
          keystoneRemote,
          req.params.userId,
          {user: {enabled}}
        ),
        userModel.update({enabled}, {where: {id: req.params.userId}})
      ];
      res.status(204).end();
    }).catch(next);

  },
  getProjectUsers: function (req, res, next) {
    const projectId = req.params.projectId;
    const that = this;
    co(function *() {
      const arrResult = yield [
        that.operation.role.listAssignment(
          req.session.user.token,
          keystoneRemote,
          {'scope.project.id': projectId}
        ),
        that.operation.role.list(
          req.session.user.token,
          keystoneRemote,
          {}
        )
      ];

      const assignments = arrResult[0].body.role_assignments;
      const roles = arrResult[1].body.roles;
      const objRoles = {};
      roles.forEach(role => objRoles[role.id] = role.name);

      const objUsers = {};
      assignments.forEach(assignment => {
        if (!objUsers[assignment.user.id]) {
          objUsers[assignment.user.id] = [];
        }
        objUsers[assignment.user.id].push(assignment);
      });

      let userIds = Object.keys(objUsers);
      let users = yield userIds.map(id => that.operation.user.get(req.session.user.token, keystoneRemote, id));
      users = users.map(user => {
        user.body.user.roles = [];
        objUsers[user.body.user.id].forEach(assignment => {
          user.body.user.roles.push({
            name: objRoles[assignment.role.id],
            id: assignment.role.id
          });
        });
        return user.body.user;
      });

      res.send(users);
    }).catch(next);
  },

  createProject: function (req, res, next) {
    const that = this;
    let token = req.session.user.token;
    let lack = [];
    let verification = ['name', 'billing_owner'];
    verification.forEach(v => {
      if (!req.body[v]) {
        lack.push(v);
      }
    });

    if (lack.length) {
      return next({
        status: 400, customRes: true,
        message: 'Bad Request - Missing Params: ' + lack.join()
      });
    }
    let name = req.body.name;
    let parentId = req.session.user.defaultProjectId;
    let userId = {
      billing_owner: req.body.billing_owner
    };

    co(function *() {
      let project = yield that.operation.project.create(token, keystoneRemote, {
        project: {
          name: name,
          description: req.body.description,
          parent_id: parentId
        }
      });
      project = project.body.project;

      let roles = yield that.operation.role.list(token, keystoneRemote, {});
      roles = roles.body.roles;

      let roleId = {billing_owner: ''};
      roles.some(role => {
        if (role.name === 'billing_owner') {
          roleId[role.name] = role.id;
          return roleId.billing_owner;
        }
      });
      yield that.operation.role.add(
        project.id,
        userId.billing_owner,
        roleId.billing_owner,
        token,
        keystoneRemote
      );

      let projects = yield base.__userProjectsAsync({userId: req.session.user.userId, token: req.session.user.token});
      req.session.user.projects = projects.body.projects;
      res.send(project);

    }).catch(next);
  },
  updateProject: function (req, res, next) {
    const that = this;
    co(function *() {
      const project = {};
      const keys = ['name', 'description'];
      keys.forEach(key => {
        if (req.body[key]) project[key] = req.body[key];
      });

      if (req.body.billing_owner) {
        const arrRes = yield [
          that.operation.project.update(
            req.session.user.token,
            keystoneRemote,
            req.params.projectId,
            {project}
          ),
          that.operation.role.list(
            req.session.user.token,
            keystoneRemote,
            {name: 'billing_owner'}
          )
        ];
        const billingOwnerRoleId =
          req.params.roleId = arrRes[1].body.roles[0].id;
        req.params.userId = req.body.billing_owner;
        //roleId

        let assignments = yield that.operation.role.listAssignment(
          req.session.user.token,
          keystoneRemote,
          {'scope.project.id': req.params.projectId}
        );
        assignments = assignments.body.role_assignments;
        const billingOwnerOldUserId = [];
        assignments.forEach(a => {
          if (a.role.id === billingOwnerRoleId && a.user.id !== req.body.billing_owner) {
            billingOwnerOldUserId.push(a.user.id);
          }
        });

        yield that.operation.role.add(
          req.params.projectId,
          req.params.userId,
          req.params.roleId,
          req.session.user.token,
          keystoneRemote
        );
        yield billingOwnerOldUserId.map(id => {
          return that.operation.role.remove(
            req.params.projectId,
            id,
            req.params.roleId,
            req.session.user.token,
            keystoneRemote
          );
        });
        let projects = yield base.__userProjectsAsync({userId: req.session.user.userId, token: req.session.user.token});
        req.session.user.projects = projects.body.projects;
        res.send(arrRes[0].body.project);
      } else {
        const projectRes = yield that.operation.project.update(
          req.session.user.token,
          keystoneRemote,
          req.params.projectId,
          {project}
        );
        let projects = yield base.__userProjectsAsync({userId: req.session.user.userId, token: req.session.user.token});
        req.session.user.projects = projects.body.projects;
        res.send(projectRes.body.project);
      }


    }).catch(next);
  },
  delProject: function (req, res, next) {
    if (req.params.projectId === req.session.user.defaultProjectId) {
      return next({customRes: true, status: 400, msg: 'cannotDeleteDefaultProject'});
    }
    const that = this;
    co(function *() {
      yield that.operation.project.del(
        req.session.user.token,
        keystoneRemote,
        req.params.projectId
      );
      let projects = yield base.__userProjectsAsync({userId: req.session.user.userId, token: req.session.user.token});
      req.session.user.projects = projects.body.projects;
      res.status(204).end();
    }).catch(next);

  },
  getProject: function (req, res, next) {
    this.operation.project.get(
      req.session.user.token,
      keystoneRemote,
      req.params.projectId
    ).then(project => {
      res.send(project.body.project);
    }, next);
  },
  getProjectList: function (req, res, next) {
    const that = this;
    co(function *() {
      const arrResult = yield [
        that.operation.project.list(
          req.session.user.userId,
          req.session.user.token,
          keystoneRemote,
          {}
        ),
        that.operation.role.list(
          req.session.user.token,
          keystoneRemote,
          {}
        )
      ];
      let projects = arrResult[0].body.projects;
      let roles = arrResult[1].body.roles;
      const roleId = {
        billing_owner: '',
        project_admin: ''
      };
      roles.some(role => {
        if (role.name === 'billing_owner' || role.name === 'project_admin') {
          roleId[role.name] = role.id;
          return roleId.billing_owner && roleId.project_admin;
        }
      });
      let assignments = yield projects.map(project => {
        project.userId = {
          billing_owner: '',
          project_admin: []
        };
        project.users = {};
        return that.operation.role.listAssignment(
          req.session.user.token,
          keystoneRemote,
          {'scope.project.id': project.id}
        );
      });
      assignments.forEach((assignment, index) => {
        assignment.body.role_assignments.some(a => {
          if (a.role.id === roleId.billing_owner) {
            projects[index].userId.billing_owner = a.user.id;
          } else if (a.role.id === roleId.project_admin) {
            projects[index].userId.project_admin.push(a.user.id);
          }
        });
      });

      let usersId = new Set();
      projects.forEach(project => {
        usersId.add(project.userId.billing_owner);
        project.userId.project_admin.forEach(id => {
          usersId.add(id);
        });
      });

      usersId = Array.from(usersId);
      let usersDetail = yield usersId.map(userId => that.operation.user.get(
        req.session.user.token,
        keystoneRemote,
        userId
      ));
      const users = {};
      usersId.forEach((userId, index) => {
        users[userId] = usersDetail[index].body.user;
      });

      projects.forEach(project => {
        project.users.billing_owner = users[project.userId.billing_owner];
        project.users.project_admin = [];
        project.userId.project_admin.forEach(id => {
          project.users.project_admin.push(users[id]);
        });
        delete project.userId;
      });
      res.send(projects);
    }).catch(next);
  },
  addRole: function (req, res, next) {
    this._assignRole('add', req, res, next);
  },
  removeRole: function (req, res, next) {
    this._assignRole('remove', req, res, next);
  },

  addRoleProjectAdmin: function (req, res, next) {
    const that = this;
    co(function *() {
      const roles = yield that.operation.role.list(
        req.session.user.token,
        keystoneRemote,
        {name: 'project_admin'}
      );
      req.params.roleId = roles.body.roles[0].id;
      that._assignRole('add', req, res, next);
    });
  },
  removeRoleProjectAdmin: function (req, res, next) {
    const that = this;
    co(function *() {
      const roles = yield that.operation.role.list(
        req.session.user.token,
        keystoneRemote,
        {name: 'project_admin'}
      );
      req.params.roleId = roles.body.roles[0].id;
      that._assignRole('remove', req, res, next);
    });
  },
  changeRoleBillingOwner: function (req, res, next) {
    const that = this;
    co(function *() {
      const roles = yield that.operation.role.list(
        req.session.user.token,
        keystoneRemote,
        {name: 'billing_owner'}
      );
      req.params.roleId = roles.body.roles[0].id;
      that._assignRole('add', req, res, next);
    });
  },
  _assignRole: function (method, req, res, next) {
    this.operation.role[method](
      req.params.projectId,
      req.params.userId,
      req.params.roleId,
      req.session.user.token,
      keystoneRemote
    ).then(() => {
      res.status(204).end();
    }, next);
  }
};

module.exports = Sub;
