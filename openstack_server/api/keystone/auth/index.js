var async = require('async');
var Driver = require('openstack_server/drivers');
var Keystone = Driver.keystone;
var Base = require('openstack_server/api/base.js');
var config = require('config');

function Auth (app, keystone) {
  this.app = app;
  this.keystone = keystone;
}

var prototype = {
  authentication: function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
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
        that.keystone.authAndToken.unscopedAuth(username, password, function(err, response) {
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
        //FIXME: add err handler
        res.status(400).json(err);
      } else {
        var expireDate = new Date(payload.token.expires_at),
          projectId = payload.token.project.id,
          regionId = cookies.region ? cookies.region : '',
          _username = payload.token.user.name,
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
          'regionId': regionId,
          'userId': userId,
          'username': _username,
          'locale': locale
        };
        res.cookie(config('sessionEngine').cookie_name, value, opt);
        res.cookie(_username, Object.assign(cookies, {
          region: regionId,
          project: projectId
        }));
        req.session.cookie.expires = new Date(expireDate);
        req.session.user = {
          'regionId': regionId,
          'projectId': projectId,
          'userId': userId,
          'token': token,
          'username': _username,
          'projects': projects
        };
        res.json({success: 'login sucess'});
      }
    });
  },
  swtichPorject: function (req, res) {
    var projectId = req.body.projectId ? req.body.projectId : req.params.projectId;
    var token = req.session.user.token;
    this.keystone.authAndToken.scopedAuth(projectId, token, function (err, response) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        req.session.cookie.expires = new Date(response.body.token.expires_at);
        req.session.user.token = response.header['x-subject-token'];
        req.session.user.projectId = projectId;
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
    res.stats(200).json({success: 'switch region successfully'});
  },
  logout: function (req, res) {
    req.session.destroy();
    res.clearCookie(config('sessionEngine').cookie_name);
    res.redirect('/');
  },
  initRoutes: function() {
    this.app.post('/auth/login', this.authentication.bind(this));
    this.app.post('/auth/switchRegion', this.swtichRegion.bind(this));
    this.app.post('/auth/switch', this.swtichPorject.bind(this));
    this.app.get('/auth/switchRegion/:region', this.swtichRegion.bind(this));
    this.app.get('/auth/switch/:projectId', this.swtichPorject.bind(this));
    this.app.get('/auth/logout', this.logout.bind(this));
  }
};

module.exports = function(app, extension) {
  Object.assign(Auth.prototype, Base.prototype);
  Object.assign(Auth.prototype, prototype);
  if (extension) {
    Object.assign(Auth.prototype, extension);
  }
  var auth = new Auth(app, Keystone);
  auth.initRoutes();
};
