var async = require('async');
var extend = require('extend');
var Keystone = require('keystone');
var config = require('config');

function Auth (app, keystone) {
  this.app = app;
  this.keystone = keystone;
}

var prototype = {
  authentication: function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    // FIXME: need to do verification
    var that = this;
    async.waterfall([
      function (cb) {
        that.keystone.unscopedAuth(username, password, function(err, response) {
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
        that.keystone.getUserProjects(userId, token, function(err, response) {
          if (err) {
            cb(err);
          } else {
            var projects = response.body.projects;
            if (projects.length < 1) {
              cb({error: 'no project'});
            } else {
              var projectId = projects[0].id;
              cb(null, projectId, token);
            }
          }
        });
      },
      function (projectId, token, cb) {
        that.keystone.scopedAuth(projectId, token, function(err, response) {
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
        //FIXME: add err handler
        res.status(400).json(err);
      } else {
        var expireDate = new Date(payload.token.expires_at),
          projectId = payload.token.project.id,
          userId = payload.token.user.id;
        var opt = {
          path: '/',
          expires: expireDate,
          signed: true,
          httpOnly: true
        };
        var locale = req.i18n.getLocale();
        var value = {
          'projectId': projectId,
          'userId': userId,
          'locale': locale
        };
        res.cookie(config('sessionEngine').cookie_name, value, opt);
        req.session.cookie.expires = expireDate;
        req.session.user = {
          projectId : projectId,
          userId : userId,
          token : token
        };
        res.json({sucess: 'login sucess'});
      }
    });
  },
  logout: function (req, res) {
    req.session.destroy();
    res.clearCookie(config('sessionEngine').cookie_name);
    res.redirect('/');
  },
  initRoutes: function() {
    this.app.post('/auth/login', this.authentication.bind(this));
    this.app.get('/auth/logout', this.logout.bind(this));
  }
};

module.exports = function(app, extension) {
  extend(Auth.prototype, prototype);
  if (extension) {
    extend(Auth.prototype, extension);
  }
  var auth = new Auth(app, Keystone);
  auth.initRoutes();
};
