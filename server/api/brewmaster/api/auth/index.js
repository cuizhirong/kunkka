'use strict';
const co = require('co');

const drivers = require('drivers');
const config = require('config');
const region = config('region');
const keystoneRemote = config('keystone');
const listUsersAsync = drivers.keystone.user.listUsersAsync;
const userModel = require('../../models').user;
const loginModel = require('../../models').loginlog;
const passwordModel = require('../../models').user_password;
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
      let {username, password, domain = config('domain') || 'Default'} = req.body;

      let loginFailed = yield base.mem.getObjAsync('loginFailed' + username, that.memClient);
      let loginFailedCount = loginFailed ? loginFailed.value : 0;

      const enableSafety = yield base._getSetBool('global', 'enable_safety');
      const enableCaptcha = yield base._getSetBool('auth', 'enable_login_captcha');
      if (enableCaptcha && loginFailedCount > 1) {
        let ctBody = req.body.captcha;
        let ctSession = req.session.captcha;
        if (!ctBody || !ctSession || String(ctBody).toLowerCase() !== String(ctSession).toLowerCase()) {
          return Promise.reject({
            code: 400,
            type: 'captchaError',
            message: req.i18n.__('api.register.CaptchaError')
          });
        }
      }
      if (enableSafety && loginFailedCount > 4) {
        return Promise.reject({
          code: 403,
          remain: loginFailed.createdAt + loginFailed.expire * 1000 - new Date().getTime(),
          type: 'manyFailures',
          message: req.i18n.__('api.register.tooManyFailures')
        });
      }

      password = base.crypto.decrypt(password, req.session.passwordId);
      let adminToken = yield adminLogin();
      let unScopedRes;
      let userToDatabase = {};
      try {
        unScopedRes = yield base.__unscopedAuthAsync({username, password, domain});
      } catch (e) {
        let users = yield listUsersAsync(adminToken.token, keystoneRemote, {name: username});
        if (users.body.users.length && !users.body.users[0].enabled) {
          return Promise.reject({
            code: 403,
            type: 'unEnabled',
            message: req.i18n.__('api.register.unEnabled')
          });
        } else {
          return Promise.reject(e);
        }
      }
      userToDatabase.id = unScopedRes.body.token.user.id;
      userToDatabase.name = unScopedRes.body.token.user.name;
      userToDatabase.enabled = 1;
      const userId = unScopedRes.body.token.user.id;

      //password expires
      if (enableSafety) {
        let passwords = yield passwordModel.findAll({
          where: {userId},
          limit: 1,
          order: [['createdAt', 'DESC']]
        });
        const expireDay = yield base._getSetNumber('auth', 'password_expires', 30);
        const newestPass = passwords[0];
        if (newestPass && new Date() - newestPass.createdAt > expireDay * 24 * 60 * 60 * 1000) {
          return Promise.reject({
            code: 403,
            type: 'passwordExpired',
            message: req.i18n.__('api.register.passwordExpired')
          });
        }
      }

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
        return Promise.reject({
          code: 403,
          type: 'noProject',
          message: 'no project'
        });
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
        return Promise.reject({
          code: 403,
          type: 'noDomain',
          message: 'no domain'
        });
      } else {
        domainId = domains[0].id;
      }

      //scope
      const scopedRes = yield base.__scopedAuthAsync({projectId, token: unScopeToken});

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
      let userDB = yield userModel.findOne({where:{id: userToDatabase.id}});
      req.session.user = {
        domainName: domain, domainId, regionId,
        projectId, projects, isAdmin, roles,
        userId, username, token: scopeToken, phone: userDB && userDB.phone
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
      if (!userDB) {
        yield userModel.destroy({where: {name: userToDatabase.name}});
        userModel.create(userToDatabase);
      }
    }).catch(e => {
      co(function* () {
        if (e.status === 401) {
          const username = req.body.username;
          const lockMin = yield base._getSetNumber('auth', 'lock_minutes', 1);

          let lastValue = yield base.mem.getObjAsync('loginFailed' + username, that.memClient);
          if (!lastValue || lastValue.value <= 5) {
            let count = lastValue ? lastValue.value : 0;
            yield base.mem.setKeyValueAsync({
              key: 'loginFailed' + req.body.username,
              value: count + 1,
              expire: lockMin * 60,
              memClient: that.memClient
            });
          }

          e = {
            code: 401,
            message: req.i18n.__('api.register.passwordError')
          };
        }
        //log
        loginModel.create({
          type: 'login', ip: req.ip, username: req.body.username,
          success: false, message: e.message
        });
        res.status(e.status || e.code).send({error: e});
      });
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
