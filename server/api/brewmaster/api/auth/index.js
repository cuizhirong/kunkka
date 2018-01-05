'use strict';
const co = require('co');

const drivers = require('drivers');
const config = require('config');
const region = config('region');
const keystoneRemote = config('keystone');
const listUsersAsync = drivers.keystone.user.listUsersAsync;
const userModel = require('../../models').user;
const loginModel = require('../../models').loginlog;
const adminLogin = require('api/slardar/common/adminLogin');
const setRemote = require('api/slardar/common/setRemote');

const base = require('../base');

function Auth(app) {
  this.app = app;
  this.memClient = app.get('CacheClient');
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
    co(function *() {
      const captchaSetting = yield base._getSettingByAppAndName('auth', 'enable_login_captcha');
      let enableLoginCaptcha = true;
      if (captchaSetting) {
        enableLoginCaptcha = captchaSetting.value;
      }
      if (enableLoginCaptcha) {
        let ctBody = req.body.captcha;
        let ctSession = req.session.captcha;
        if (!ctBody || !ctSession || String(ctBody).toLowerCase() !== String(ctSession).toLowerCase()) {
          return Promise.reject({
            status: 400,
            message: {message: req.i18n.__('api.register.CaptchaError'), code: 400}
          });
        }
      }

      let {username, password, domain = config('domain') || 'Default'} = req.body;
      let adminToken = yield adminLogin();

      let unScopedRes;
      let userToDatabase = {};
      try {
        unScopedRes = yield base.__unscopedAuthAsync({username, password, domain});
      } catch (e) {
        let users = yield listUsersAsync(adminToken.token, keystoneRemote, {name: username});
        if (users.body.users.length && !users.body.users[0].enabled) {
          return Promise.reject({
            status: 403,
            message: {message: req.i18n.__('api.register.unEnabled'), code: 403}
          });
        } else {
          return Promise.reject(e);
        }
      }
      userToDatabase.id = unScopedRes.body.token.user.id;
      userToDatabase.name = unScopedRes.body.token.user.name;
      userToDatabase.enabled = 1;
      const userId = unScopedRes.body.token.user.id;
      let unScopeToken = unScopedRes.header['x-subject-token'];
      let cookies = getCookie(req, userId);

      //projects
      const results = yield {
        project: base.__userProjectsAsync({userId: userId, token: unScopeToken}),
        domain: drivers.keystone.domain.listDomainsAsync(adminToken.token, keystoneRemote, {name: domain})
      };
      let projectId, domainId;
      const projects = results.project.body.projects;
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
      const domains = results.domain.body.domains;
      if (!domains.length) {
        return Promise.reject({error: 'no domain'});
      } else {
        domainId = domains[0].id;
      }

      //scope
      const scopedRes = yield base.__scopedAuthAsync({
        projectId: projectId,
        token: unScopeToken
      });

      const payload = scopedRes.body;
      let scopeToken = scopedRes.header['x-subject-token'];
      let regionId = region[0].id;
      region.some(r => {
        if (r.id === cookies.region) {
          regionId = cookies.region;
          return true;
        } else {
          return false;
        }
      });

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
      let roles = payload.token.roles.map(role => {
        if (role.name === 'admin') {
          isAdmin = true;
        }
        return role.name;
      });
      req.session.user = {
        domainName: domain, domainId, regionId,
        projectId, projects, isAdmin, roles,
        userId, username, token: scopeToken
      };
      req.session.endpoint = setRemote(payload.token.catalog);
      //log
      loginModel.create({type: 'login', ip: req.ip, username, success: true});
      if (!req.isAuthNotReturn) {
        res.json({success: 'login success'});
      } else {
        next();
      }

      //online in devices
      let enableSafety = yield base._getSettingByAppAndName('admin', 'safety_enablae');
      enableSafety = enableSafety ? enableSafety.value : true;
      if (enableSafety) {
        const memClient = that.memClient;
        let oldSessionId = yield memClient.getAsync('sessionID' + userId);
        oldSessionId = oldSessionId[0] && oldSessionId[0].toString();
        if (oldSessionId) {
          yield memClient.deleteAsync(oldSessionId);
        }
        yield memClient.setAsync('sessionID' + userId, req.sessionID);
      }

      //createUser in database
      if (userToDatabase.id) {
        let userDB = yield userModel.findOne({where:{id: userToDatabase.id}});
        if (!userDB) {
          yield userModel.destroy({where: {name: userToDatabase.name}});
          userModel.create(userToDatabase);
        }
      }
    }).catch(e => {
      //log
      loginModel.create({
        type: 'login', ip: req.ip, username: req.body.username,
        success: false, message: e.message.message
      });
      next(e);
    });
  },
  switchProject: function (req, res, next) {
    let projectId = req.body.projectId ? req.body.projectId : req.params.projectId;
    let token = req.session.user.token;

    co(function *() {
      const response = yield base.__scopedAuthAsync({projectId, token});

      req.session.endpoint = setRemote(response.body.token.catalog);
      req.session.user.projectId = projectId;
      req.session.user.token = response.header['x-subject-token'];
      req.session.cookie.expires = new Date(response.body.token.expires_at);
      req.session.user.isAdmin = response.body.token.roles.some(role => role.name === 'admin');
      req.session.user.roles = response.body.token.roles.map(role => {
        return role.name;
      });
      let userId = req.session.user.userId;
      const cookies = getCookie(req, userId);
      res.cookie(userId, Object.assign(cookies, {
        project: projectId
      }));
      res.json({success: 'switch project successfully'});

    }).catch(next);
  },
  switchRegion: function (req, res) {
    let userId = req.session.user.userId;
    let cookies;
    cookies = getCookie(req, userId);
    res.cookie(userId, Object.assign(cookies, {
      region: (req.session.user.regionId = req.body.region ? req.body.region : req.params.region)
    }));
    res.status(200).json({success: 'switch region successfully'});
  },
  logout: function (req, res) {
    if (req.session && req.session.user) {
      let log = {type: 'logout', username: req.session.user.username, success: true, ip: req.ip};
      loginModel.create(log);
    }
    req.session.destroy();
    res.redirect('/');
  },
  initRoutes: function () {
    this.app.post('/auth/login', this.authentication.bind(this));
    this.app.put('/auth/switch_region', this.switchRegion.bind(this));
    this.app.put('/auth/switch_project', this.switchProject.bind(this));
    this.app.get('/auth/logout', this.logout.bind(this));
  }
};


module.exports = Auth;
