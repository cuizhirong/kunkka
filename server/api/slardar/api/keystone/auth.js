'use strict';

const co = require('co');

const drivers = require('drivers');
const Base = require('../base.js');
const config = require('config');
const region = config('region');

const keystoneRemote = config('keystone');

const adminLogin = require('../../common/adminLogin');
const listUsersAsync = drivers.keystone.user.listUsersAsync;


function Auth(app) {
  this.app = app;
  Base.call(this);
}

function Obj() {
}
Obj.prototype = Object.create(null);

function setRemote(catalog) {
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

function getCookie(req, userId) {
  let _cookies;
  if (!req.cookies[userId]) {
    _cookies = {
      region: '',
      project: ''
    };
  } else {
    _cookies = req.cookies[userId];
  }
  return _cookies;
}

Auth.prototype = {
  authentication: function (req, res, next) {
    const that = this;
    let _username = req.body.username;
    let _password = req.body.password;
    let _domain = req.body.domain || config('domain') || 'Default';

    co(function *() {
      //unscope
      let unScopedRes;
      try {
        unScopedRes = yield that.__unscopedAuthAsync({
          username: _username,
          password: _password,
          domain: _domain
        });
      } catch (e) {
        let adminToken = yield adminLogin();
        let user = yield listUsersAsync(
          adminToken.token,
          keystoneRemote,
          {name: req.body.username}
        );
        if (user.body.users.length && !user.body.users[0].enabled) {
          return Promise.reject({
            status: 403,
            message: {
              message: req.i18n.__('api.keystone.unEnabled'),
              code: 403
            }
          });
        } else {
          return Promise.reject(e);
        }
      }

      const userId = unScopedRes.body.token.user.id;
      let unScopeToken = unScopedRes.header['x-subject-token'];
      let cookies = getCookie(req, userId);

      //projects
      const projectRes = yield that.__userProjectsAsync({
        userId: userId,
        token: unScopeToken
      });
      const projects = projectRes.body.projects;
      let projectId;
      if (projects.length < 1) {
        return Promise.reject({error: 'no project'});
      } else {
        projectId = projects[0].id;
        if (cookies.project) {
          projects.some(p => {
            return (p.id === cookies.project) && (projectId = cookies.project);
          });
        }
      }

      //scope
      const scopedRes = yield that.__scopedAuthAsync({
        projectId: projectId,
        token: unScopeToken
      });

      const payload = scopedRes.body;
      let scopeToken = scopedRes.header['x-subject-token'];
      let username = payload.token.user.name;
      let regionId = cookies.region ? cookies.region : region[0].id;
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
      let isAdmin = false;
      let _roles = payload.token.roles.map(role => {
        if (role.name === 'admin') {
          isAdmin = true;
        }
        return role.name;
      });
      req.session.user = {
        'regionId': regionId,
        'projectId': projectId,
        'userId': userId,
        'token': scopeToken,
        'username': username,
        'projects': projects,
        'isAdmin': isAdmin,
        'roles': _roles
      };
      req.session.endpoint = setRemote(payload.token.catalog);
      if (!req.isAuthNotReturn) {
        res.json({success: 'login sucess'});
      } else {
        next();
      }
    }).catch(err => {
      that.handleError(err, req, res, next);
    });
  },
  swtichProject: function (req, res, next) {
    let projectId = req.body.projectId ? req.body.projectId : req.params.projectId;
    let token = req.session.user.token;
    let cookies;
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
        req.session.user.roles = response.body.token.roles.map(role => {
          return role.name;
        });
        let userId = req.session.user.userId;
        cookies = getCookie(req, userId);
        res.cookie(userId, Object.assign(cookies, {
          project: projectId
        }));
        res.json({success: 'switch project successfully'});
      }
    });
  },
  swtichRegion: function (req, res) {
    let userId = req.session.user.userId;
    let cookies;
    cookies = getCookie(req, userId);
    res.cookie(userId, Object.assign(cookies, {
      region: (req.session.user.regionId = req.body.region ? req.body.region : req.params.region)
    }));
    res.status(200).json({success: 'switch region successfully'});
  },
  logout: function (req, res) {
    req.session.destroy();
    res.redirect('/');
  },
  initRoutes: function () {
    return this.__initRoutes(() => {
      this.app.post('/auth/login', this.authentication.bind(this));
      this.app.put('/auth/switch_region', this.swtichRegion.bind(this));
      this.app.put('/auth/switch_project', this.swtichProject.bind(this));
      this.app.get('/auth/logout', this.logout.bind(this));
    });
  }
};

Object.assign(Auth.prototype, Base.prototype);

module.exports = Auth;
