'use strict';
const co = require('co');

const base = require('../base.js');
const paginate = require('helpers/paginate.js');
const async = require('async');
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
      drivers.keystone.user.createUser(token, remote, {user: userObj}, function (err, data) {
        if (err) {
          res.status(err.status).json(err);
        } else {
          res.json(data);
        }
      });
    } else {
      let projectName = req.body.project_name;
      let role = req.body.role;
      async.parallel([
        function (callback) {
          drivers.keystone.user.listUsers(token, remote, function (err, data) {
            if (err) {
              callback(err);
            } else {
              callback(null, data);
            }
          }, {name: userObj.name});
        },
        function (callback) {
          drivers.keystone.project.listProjects(token, remote, function (err, data) {
            if (err) {
              callback(err);
            } else {
              callback(null, data);
            }
          }, {name: projectName});
        }
      ], function (err, results) {
        if (err) {
          res.status(500).json(err.response.text);
        } else {
          if (results[0].body.users.length > 0) {
            res.status(404).json({error: req.i18n.__('api.keystone.duplicateUser')});
          } else if (results[1].body.projects.length > 0) {
            res.status(404).json({error: req.i18n.__('api.keystone.duplicateProject')});
          } else {
            async.parallel([
              function (callback) {
                drivers.keystone.user.createUser(token, remote, {user: userObj}, function (_err, data) {
                  if (_err) {
                    callback(_err);
                  } else {
                    callback(null, data);
                  }
                });
              },
              function (callback) {
                drivers.keystone.project.createProject(token, remote, function (_err, data) {
                  if (_err) {
                    callback(_err);
                  } else {
                    callback(null, data);
                  }
                }, {project: {domain_id: req.body.domain_id, name: projectName}});
              }
            ], function (_err, _results) {
              if (_err) {
                res.status(_err.status).json(_err.response.text);
              } else {
                let user = _results[0].body.user;
                let project = _results[1].body.project;
                drivers.keystone.role.addRoleToUserOnProject(project.id, user.id, role, token, remote, function (error, data) {
                  if (error) {
                    res.status(error.status).json(error.response.text);
                  } else {
                    res.json(data.text);
                  }
                });
              }
            });
          }
        }
      });
    }
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
