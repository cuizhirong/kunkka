'use strict';

const async = require('async');
const Base = require('../base.js');
const config = require('config');

function Auth (app) {
  this.app = app;
  Base.call(this);
}

function Obj() {}
Obj.prototype = Object.create(null);

function setRemote (catalog) {
  let remote = new Obj();
  let oneRemote;
  for (let i = 0, l = catalog.length, service = catalog[0]; i < l; i++, service = catalog[i]) {
    if (!remote[service.name]) {
      remote[service.name] = oneRemote = new Obj();
    }
    for (let j = 0, m = service.endpoints.length, endpoint = service.endpoints[0]; j < m; j++, endpoint = service.endpoints[j]) {
      if (endpoint.interface === 'public') {
        oneRemote[endpoint.region_id] = endpoint.url.split('/').slice(0, 3).join('/');
      }
    }
  }
  return remote;
}

Auth.prototype = {
  authentication: function (req, res, next) {
    let _username = req.body.username;
    let _password = req.body.password;
    let _domain = req.body.domain || config('domain') || 'Default';
    let projects;
    let cookies;
    async.waterfall([
      (cb) => {
        this.__unscopedAuth.call(this, {
          username: _username,
          password: _password,
          domain: _domain
        }, (err, response) => {
          if (err) {
            cb(err);
          } else {
            let userId = response.body.token.user.id;
            let token = response.header['x-subject-token'];
            if (!req.cookies[userId]) {
              cookies = {
                region: '',
                project: ''
              };
            } else {
              cookies = req.cookies[userId];
            }
            cb(null, userId, token);
          }
        });
      },
      (userId, token, cb) => {
        this.__userProjects.call(this, {
          userId: userId,
          token: token
        }, (err, response) => {
          if (err) {
            cb(err);
          } else {
            projects = response.projects;
            if (projects.length < 1) {
              cb({error: 'no project'});
            } else {
              let projectId = projects[0].id;
              if (cookies.project) {
                projects.some( p => {
                  return (p.id === cookies.project) && (projectId = cookies.project);
                });
              }
              cb(null, projectId, token);
            }
          }
        });
        delete this.token;
      },
      (projectId, token, cb) => {
        this.__scopedAuth.call(this, {
          projectId: projectId,
          token: token
        }, (err, response) => {
          if (err) {
            cb(err);
          } else {
            let _token = response.header['x-subject-token'];
            cb(null, _token, response.body);
          }
        });
        delete this.token;
      }
    ],
    (err, token, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        let userId = payload.token.user.id;
        let username = payload.token.user.name;
        let projectId = payload.token.project.id;
        let regionId = cookies.region ? cookies.region : '';
        let expireDate = new Date(payload.token.expires_at);
        let opt = {
          path: '/',
          maxAge: config('cookie').maxAge ? config('cookie').maxAge : 1000 * 3600 * 24 * 7,
          httpOnly: true
        };
        res.cookie(userId, Object.assign(cookies, {
          region: regionId,
          project: projectId
        }), opt);
        req.session.cookie.expires = expireDate;
        let isAdmin = payload.token.roles.some(role => {
          return role.name === 'admin';
        });
        req.session.user = {
          'regionId': regionId,
          'projectId': projectId,
          'userId': userId,
          'token': token,
          'username': username,
          'projects': projects,
          'isAdmin': isAdmin
        };
        req.session.endpoint = setRemote(payload.token.catalog);
        res.json({success: 'login sucess'});
      }
    });
  },
  swtichProject: function (req, res, next) {
    let projectId = req.body.projectId ? req.body.projectId : req.params.projectId;
    let token = req.session.user.token;
    this.__scopedAuth.call(this, {
      projectId: projectId,
      token: token
    }, (err, response) => {
      if (err) {
        next(err);
      } else {
        req.session.endpoint = setRemote(response.body.token.catalog);
        req.session.user.projectId = projectId;
        req.session.user.token = response.header['x-subject-token'];
        req.session.cookie.expires = new Date(response.body.token.expires_at);
        req.session.user.isAdmin = response.body.token.roles.some(role => {
          return role.name === 'admin';
        });
        let userId = req.session.user.userId;
        res.cookie(userId, Object.assign(req.cookies[userId], {
          project: projectId
        }));
        res.json({success: 'switch project successfully'});
      }
    });
  },
  swtichRegion: function (req, res) {
    let userId = req.session.user.userId;
    res.cookie(userId, Object.assign(req.cookies[userId], {
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
      this.app.put('/auth/switch_project', this.swtichProject.bind(this));
      this.app.get('/auth/logout', this.logout.bind(this));
    });
  }
};

Object.assign(Auth.prototype, Base.prototype);

module.exports = Auth;
