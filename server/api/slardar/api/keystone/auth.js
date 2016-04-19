'use strict';

var async = require('async');
var Base = require('../base.js');
var config = require('config');

function Auth (app) {
  this.app = app;
  this.arrService = ['keystone'];
  this.arrServiceObject = [];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Auth.prototype = {
  authentication: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var domain = req.body.domain || config('domain') || 'Default';
    var projects;
    var cookies;
    if (!req.cookies[username]) {
      cookies = {
        region: '',
        project: ''
      };
    } else {
      cookies = req.cookies[username];
    }
    // FIXME: need to do verification
    var that = this;
    async.waterfall([
      function (cb) {
        that.keystone.authAndToken.unscopedAuth(username, password, domain, function(err, response) {
          if (err) {
            cb(err);
          } else {
            var userId = response.body.token.user.id;
            var token = response.header['x-subject-token'];
            cb(null, userId, token);
          }
        });
      },
      function (userId, token, cb) {
        that.keystone.project.getUserProjects(userId, token, function(err, response) {
          if (err) {
            cb(err);
          } else {
            projects = response.body.projects;
            if (projects.length < 1) {
              cb({error: 'no project'});
            } else {
              var projectId = projects[0].id;
              if (cookies.project) {
                Object.keys(projects).some( p => {
                  return (p.id === cookies.project) && (projectId = cookies.project);
                });
              }
              cb(null, projectId, token);
            }
          }
        });
      },
      function (projectId, token, cb) {
        that.keystone.authAndToken.scopedAuth(projectId, token, function(err, response) {
          if (err) {
            cb(err);
          } else {
            var _token = response.header['x-subject-token'];
            cb(null, _token, response.body);
          }
        });
      }
    ],
    function (err, token, payload) {
      if (err) {
        next(err);
      } else {
        var expireDate = new Date(payload.token.expires_at),
          projectId = payload.token.project.id,
          regionId = cookies.region ? cookies.region : '',
          _username = payload.token.user.name,
          userId = payload.token.user.id;
        var opt = {
          path: '/',
          maxAge: config('cookie').maxAge ? config('cookie').maxAge : 1000 * 3600 * 24 * 7,
          httpOnly: true
        };
        res.cookie(_username, Object.assign(cookies, {
          region: regionId,
          project: projectId
        }), opt);
        req.session.cookie.expires = new Date(expireDate);
        var isAdmin = payload.token.roles.some(role => {
          return role.name === 'admin';
        });
        req.session.user = {
          'regionId': regionId,
          'projectId': projectId,
          'userId': userId,
          'token': token,
          'username': _username,
          'projects': projects,
          'isAdmin': isAdmin
        };
        res.json({success: 'login sucess'});
      }
    });
  },
  swtichPorject: function (req, res, next) {
    var projectId = req.body.projectId ? req.body.projectId : req.params.projectId;
    var token = req.session.user.token;
    this.keystone.authAndToken.scopedAuth(projectId, token, function (err, response) {
      if (err) {
        next(err);
      } else {
        req.session.cookie.expires = new Date(response.body.token.expires_at);
        req.session.user.token = response.header['x-subject-token'];
        req.session.user.projectId = projectId;
        req.session.user.isAdmin = response.body.token.roles.some(role => {
          return role.name === 'admin';
        });
        var username = req.session.user.username;
        res.cookie(username, Object.assign(req.cookies[username], {
          project: projectId
        }));
        res.json({success: 'switch project successfully'});
      }
    });
  },
  swtichRegion: function (req, res) {
    var username = req.session.user.username;
    res.cookie(username, Object.assign(req.cookies[username], {
      region: (req.session.user.regionId = req.body.region ? req.body.region : req.params.region)
    }));
    res.status(200).json({success: 'switch region successfully'});
  },
  logout: function (req, res) {
    req.session.destroy();
    res.redirect('/');
  },
  initRoutes: function() {
    return this.__initRoutes( () => {
      this.app.post('/auth/login', this.authentication.bind(this));
      this.app.put('/auth/switch_region', this.swtichRegion.bind(this));
      this.app.put('/auth/switch_project', this.swtichPorject.bind(this));
      this.app.get('/auth/logout', this.logout.bind(this));
    });
  }
};

Object.assign(Auth.prototype, Base.prototype);

module.exports = Auth;
