'use strict';

const Promise = require('bluebird');
const co = require('co');

const userModel = require('../../models').user;
const drivers = require('drivers');
const base = require('../base');
const config = require('config');
const keystoneRemote = config('keystone');
const domainName = config('domain') || 'Default';

const createUser = Promise.promisify(drivers.keystone.user.createUser);
const getUser = Promise.promisify(drivers.keystone.user.getUser);
const updateUser = drivers.keystone.user.updateUser;
const listDomains = Promise.promisify(drivers.keystone.domain.listDomains);
const getUserAsync = drivers.keystone.user.getUserAsync;
const createProjectAsync = drivers.keystone.project.createProjectAsync;
const listProjectsAsync = drivers.keystone.project.listProjectsAsync;
const listRolesAsync = drivers.keystone.role.listRolesAsync;
const addRoleToUserOnProjectAsync = drivers.keystone.role.addRoleToUserOnProjectAsync;
const assignRoleToUserOnProjectInSubtreeAsync = drivers.keystone.inherit.assignRoleToUserOnProjectInSubtreeAsync;
const sendEmailAsync = drivers.kiki.email.sendEmailAsync;
const updateUserAsync = drivers.keystone.user.updateUserAsync;
let memcachedClient;

function User(app) {
  this.app = app;
  this.memcachedClient = memcachedClient = app.get('CacheClient');
  this.memcachedGet = Promise.promisify(
    memcachedClient.get.bind(memcachedClient),
    {multiArgs: true}
  );
}


User.prototype = {

  reg: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    let that = this;
    const needed = ['name', 'password', 'email', 'phone', 'code'];
    const lack = [];
    needed.forEach(item => {
      req.body[item] || lack.push(item);
    });
    if (lack.length) {
      return next({
        status: 400,
        customRes: true,
        type: 'MissParams',
        location: lack,
        message: __('api.register.MissParams')
      });
    }

    let domainId;
    listDomains(req.admin.token, keystoneRemote, {name: domainName, enabled: true}).then((domainRes) => {
      let domains = domainRes.body.domains;
      if (domains.length) {
        domainId = domainRes.body.domains[0].id;

        //keystone
        return Promise.props({
          email: Promise.promisify(base.func.verifyUser)(req.admin.token, {email: req.body.email}),
          name: Promise.promisify(base.func.verifyByName)(req.admin.token, req.body.name)
        });
      } else {
        return Promise.reject({
          status: 404,
          customRes: true,
          type: 'SystemError',
          message: __('api.register.domainNotFound')
        });
      }
    }).then((used) => {
      let message = [];
      for (let key in used) {
        if (used[key]) {
          message.push(key);
        }
      }

      if (message.length) {
        return Promise.reject({
          status: 409,
          customRes: true,
          location: message,
          type: 'Conflict',
          message: __('api.register.Used')
        });
      }

      let phone = parseInt(req.body.phone, 10);

      if (!(/^1[34578]\d{9}$/.test(phone))) {
        return Promise.reject({
          status: 400,
          customRes: true,
          type: 'ParamsError',
          location: ['phone'],
          message: __('api.register.PhoneError')
        });
      }

      return that.memcachedGet(phone.toString());
    })
      .then((codeRes) => {
        let code = parseInt(req.body.code, 10);
        if (codeRes && codeRes[0] && JSON.parse(codeRes[0].toString()).code === code) {

          return Promise.all([
            userModel.findOne({where: {email: req.body.email}}),
            userModel.findOne({where: {phone: req.body.phone}})
          ]);
        } else {
          return Promise.reject({
            status: 400,
            customRes: true,
            type: 'ParamsError',
            location: ['code'],
            message: __('api.register.CodeError')
          });
        }
      })
      .then(result => {
        return Promise.map(result, (user) => {
          if (user) {
            return user.destroy();
          }
        });
      })
      //Keystone
      .then(() => {
        return createUser(req.admin.token, keystoneRemote, {
          user: {
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
            domain_id: domainId,
            enabled: false
          }
        });
      })

      //MySQL
      .then((result) => {
        let user = result.body.user;
        if (user.links) {
          user.links = JSON.stringify(user.links);
        }
        user.phone = req.body.phone;
        user.area_code = config('phone_area_code') || '86';

        userModel.create(user);
      })

      .then(() => {
        res.json({type: 'message', message: __('api.register.SendSuccess')});
      })
      .catch(err => {
        next(err);
      });

  },

  enable: function (req, res, next) {
    const __ = req.i18n.__.bind(req.i18n);
    const that = this;
    const tokenUrl = req.query.token;
    const id = req.query.user;

    if (!id || !tokenUrl) {
      return next({
        customRes: true,
        status: 400,
        type: 'BadRequest',
        message: __('api.register.LinkError')
      });
    }

    co(function *() {

      const userDB = yield userModel.findOne({where: {id: id}});
      if (!userDB) {
        return Promise.reject({
          customRes: true,
          status: 404,
          type: 'NotFound',
          message: __('api.register.UserNotExist')
        });
      }

      let userKeystone = yield getUserAsync(req.admin.token, keystoneRemote, userDB.id);
      userKeystone = userKeystone.body.user;
      if (userKeystone.enabled) {
        return Promise.reject({
          customRes: true,
          type: '',
          message: __('api.register.Enabled')
        });
      }

      let tokenGet = yield that.memcachedClient.getAsync(id);
      tokenGet = tokenGet[0] && tokenGet[0].toString();
      tokenGet = JSON.parse(tokenGet);
      tokenGet = tokenGet && tokenGet.token;

      if (tokenGet !== tokenUrl) {
        return Promise.reject({
          customRes: true,
          status: 400,
          type: 'Bad Request',
          message: __('api.register.LinkError')
        });
      }

      //USERNAME_project
      let projectId;
      try {
        let project = yield createProjectAsync(
          req.admin.token,
          keystoneRemote,
          {project: {name: userKeystone.name + '_project'}}
        );
        projectId = project.body.project.id;
      } catch (err) {
        if (err.status === 409) {
          let projects = yield listProjectsAsync(
            req.admin.token,
            keystoneRemote,
            {name: userKeystone.name + '_project'}
          );
          projectId = projects.body.projects[0] && projects.body.projects[0].id;
        } else {
          return Promise.reject(err);
        }
      }

      //GET ROLE billing_owner, project_owner
      let roles = yield listRolesAsync(req.admin.token, keystoneRemote, {});
      roles = roles.body.roles;

      const roleId = {
        'billing_owner': '',
        'project_owner': ''
      };
      roles.some(role => {
        if (role.name === 'billing_owner' || role.name === 'project_owner') {
          roleId[role.name] = role.id;
          return roleId.billing_owner && roleId.project_owner;
        }
      });

      //Assign Role & Update User
      yield [
        addRoleToUserOnProjectAsync(
          projectId,
          userKeystone.id,
          roleId.billing_owner,
          req.admin.token,
          keystoneRemote
        ),
        addRoleToUserOnProjectAsync(
          projectId,
          userKeystone.id,
          roleId.project_owner,
          req.admin.token,
          keystoneRemote
        ),
        assignRoleToUserOnProjectInSubtreeAsync(
          projectId,
          userKeystone.id,
          roleId.project_owner,
          req.admin.token,
          keystoneRemote
        ),
        updateUserAsync(
          req.admin.token,
          keystoneRemote,
          userKeystone.id,
          {user: {enabled: true, default_project_id: projectId}}
        )
      ];

      userDB.enabled = true;
      userDB.projectId = projectId;
      yield userDB.save();
      yield that.memcachedClient.deleteAsync(userDB.id);
      base.func.render({
        req, res, next,
        view: 'single',
        content: {
          message: __('api.register.EnableSuccess')
        }
      });

    }).catch((e) => {
      base.func.render({
        req, res, next, err: e,
        code: 500,
        view: 'single'
      });
    });
  },

  email: function (req, res, next) {
    let phone = req.body.phone;
    let email = req.body.email;
    let __ = req.i18n.__.bind(req.i18n);
    let that = this;

    userModel.findOne({
      where: {
        email: email,
        phone: phone
      }
    }).then(user => {
      if (!user) {
        return Promise.reject({type: 'Conflict', location: 'email', message: __('api.register.UserNotExist')});
      } else {
        return Promise.props({
          userKeystone: getUser(req.admin.token, keystoneRemote, user.id),
          userDB: user
        });
      }
    }).then(result => {
      let userKeystone = result.userKeystone;
      let userDB = result.userDB;
      if (userKeystone.enabled) {
        userDB.enabled = true;
        userDB.save().then(() => {
          res.send({type: 'message', message: __('api.register.Enabled')});
        }).catch(err => {
          next(__('api.register.SystemError'));
        });
      } else {
        userDB.enabled = false;
        userDB.save().then(() => {
          that._sendEmail(userDB, req, (err) => {
            if (err) {
              next(err);
            } else {
              res.json({type: 'message', message: __('api.register.SendSuccess')});
            }
          });
        }).catch(next);
      }
    }).catch(next);

  },
  _sendEmail: function (user, req, cb) {
    if (typeof cb === 'function') {
      const __ = req.i18n.__.bind(req.i18n);

      base.func.emailTokenMem(user, this.memcachedClient, __, (e, token) => {
        if (e) {
          cb(e);
        } else {
          let href = `${req.protocol}://${req.hostname}/auth/register/enable?user=${user.id}&token=${token}`;
          drivers.kiki.email.sendEmail(
            user.email,
            __('api.register.UserEnable'),
            `
            <p><a href="${href}">${__('api.register.clickHereToEnableYourAccount')}</a></p>
            <p>${__('api.register.LinkFailedCopyTheHref')}</p>
            <p>${href}</p>
            `,
            req.admin.kikiRemote,
            req.admin.token,
            cb
          );
        }
      });
    }

  },


  verifyPhone: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    let phone = parseInt(req.body.phone, 10);

    if (!(/^1[34578]\d{9}$/.test(phone))) {
      return res.status(500).send({type: 'message', message: __('api.register.PhoneError')});
    }

    base.func.verifyUser(req.admin.token, {phone: phone}, (err, used) => {
      if (err) {
        next(__('api.register.SystemError'));
      } else if (used) {
        res.status(400).send({type: 'message', message: __('api.register.Phone') + phone + __('api.register.Used')});
      } else {
        base.func.phoneCaptchaMem(phone, memcachedClient, req, res, next);
      }
    });
  },

  uniqueEmail: function (req, res, next) {
    let email = req.body.email;
    let __ = req.i18n.__.bind(req.i18n);

    base.func.verifyUser(req.admin.token, {email: email}, (err, used) => {
      if (err) {
        next(__('api.register.SystemError'));
      } else if (used) {
        res.status(400).send({type: 'message', message: __('api.register.Email') + __('api.register.Used')});
      } else {
        res.send({type: 'message', message: __('api.register.Email') + __('api.register.Available')});
      }
    });
  },

  uniqueName: function (req, res, next) {
    let name = req.body.name;
    let __ = req.i18n.__.bind(req.i18n);
    base.func.verifyByName(req.admin.token, name, (err, used) => {
      if (err) {
        next(__('api.register.SystemError'));
      } else if (used) {
        res.status(400).send({type: 'message', message: __('api.register.Name') + __('api.register.Used')});
      } else {
        res.send({type: 'message', message: __('api.register.Name') + __('api.register.Available')});
      }
    });
  },

  regSuccess: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);

    let query = {};
    Object.assign(query, req.query);
    if (!query.email && !query.name) {
      return base.func.render({
        req, res,
        err: {
          status: 404,
          customRes: true,
          message: __('api.register.UserNotExist')
        }
      });
    }

    co(function *() {
      let email;
      let userDB = yield userModel.findOne({where: query});
      if (!userDB) {
        return base.func.render({
          req, res,
          err: {
            status: 404,
            customRes: true,
            message: __('api.register.UserNotExist')
          }
        });
      }
      let userKeystone;
      try {
        userKeystone = yield getUserAsync(req.admin.token, keystoneRemote, userDB.id);
      } catch (e) {
        if (e.status === 404) {
          yield userDB.destory();
          return base.func.render({
            req, res,
            err: {
              status: 404,
              customRes: true,
              message: __('api.register.UserNotExist')
            }
          });
        } else {
          return Promise.reject(e);
        }
      }
      userKeystone = userKeystone.body.user;
      if (!userDB.email && !userKeystone.email) {
        return base.func.render({
          req, res,
          err: {
            customRes: true,
            message: __('api.register.UserNotHaveEmail')
          }
        });
      }
      email = userKeystone.email || userDB.email;

      if (userKeystone.enabled) {
        return base.func.render({
          req, res,
          err: {
            status: 404,
            customRes: true,
            message: __('api.register.Enabled')
          }
        });
      }

      let token;
      try {
        token = yield base.func.emailTokenMemAsync(userKeystone, memcachedClient, __);
      } catch (err) {
        return base.func.render({req, res, err});
      }

      const href = `${req.protocol}://${req.hostname}/auth/register/enable?user=${userKeystone.id}&token=${token}`;
      yield sendEmailAsync(
        email,
        __('api.register.UserEnable'),
        `
        <p><a href="${href}">${__('api.register.clickHereToEnableYourAccount')}</a></p>
        <p>${__('api.register.LinkFailedCopyTheHref')}</p>
        <p>${href}</p>
        `,
        req.admin.kikiRemote,
        req.admin.token
      );
      let opt = {req, res, view: 'sendEmail', content: {}};

      opt.content.email = email;
      opt.content.locale = req.i18n.locale;
      base.func.render(opt);

    }).catch(err => {
      return base.func.render({req, res, err});
    });
  },

  changeEmail: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    let email = req.query.email;
    let msg = '';

    base.func.verifyUser(req.admin.token, {email: email}, (err, used, user) => {
      if (err) {
        msg = __('api.register.SystemError');
      } else if (!used || !user) {
        msg = __('api.register.UserNotExist');
      } else if (user.enabled) {
        msg = __('api.register.Enabled');
      }

      base.func.getTemplateObj((errObj, obj) => {
        if (msg || errObj) {
          obj.locale = req.i18n.locale;
          obj.subtitle = obj.message = msg || __('api.register.SystemError');
          res.status(500).render('single', obj);
        } else {
          obj.subtitle = req.i18n.__('api.register.ChangeEmail');
          obj.locale = req.i18n.locale;
          res.render('changeEmail', obj);
        }
      });
    });
  },

  getPhoneCaptchaForChangeEmail: function (req, res, next) {

    let phone = req.body.phone;
    if (!(/^1[34578]\d{9}$/.test(phone))) {
      return res.status(500).send({type: 'message', message: __('api.register.PhoneError')});
    }
    base.func.verifyUser(req.admin.token, {phone: phone}, (err, result, user) => {
      let type = '';
      if (err) {
        type = 'SystemError';
      } else if (!result || !user) {
        type = 'UserNotExist';
      } else if (user.enabled) {
        type = 'Enabled';
      }
      if (type) {
        res.status(500).send({type: type, message: req.i18n.__('api.register.' + type)});
      } else {
        base.func.phoneCaptchaMem(phone, memcachedClient, req, res, next);
      }
    });

  },
  changeEmailSubmit: function (req, res, next) {
    let phone = req.body.phone;
    let code = parseInt(req.body.captcha, 10);
    let email = req.body.email;
    let __ = req.i18n.__.bind(req.i18n);
    let that = this;

    base.func.verifyUser(req.admin.token, {phone: phone}, (errVerify, used, u) => {
      let msg = '';
      if (errVerify) {
        msg = __('api.register.SystemError');
      } else if (!used || !u) {
        msg = __('api.register.UserNotExist');
      } else if (u.enabled) {
        msg = __('api.register.Enabled');
      }

      if (msg) {
        base.func.getTemplateObj((errObj, obj) => {
          obj.locale = req.i18n.locale;
          obj.subtitle = obj.message = errObj ? __('api.register.SystemError') : msg;
          res.status(500).render('single', obj);
        });
      } else {

        that.memcachedGet(phone.toString()).then((codeRes) => {
          if (codeRes && codeRes[0] && JSON.parse(codeRes[0].toString()).code === code) {
            return userModel.findOne({where: {phone: phone}});
          } else {
            return Promise.reject({status: 400, customRes: true, type: '', message: __('api.register.CodeError')});
          }
        }).then(user => {

          if (!user) {
            return Promise.reject({status: 404, customRes: true, type: '', message: __('api.register.UserNotExist')});
          } else {
            user.email = email;
            Promise.props({
              db: user.save(),
              keystone: Promise.promisify(updateUser)(req.admin.token, keystoneRemote, user.id, {user: {email: email}})
            });
          }
        }).then(() => {
          res.redirect(`${req.protocol}://${req.hostname}/auth/register/success?email=${email}`);
        }).catch(err => {
          base.func.getTemplateObj((errObj, obj) => {
            if (errObj || !err.customRes) {
              obj.subtitle = obj.message = __('api.register.SystemError');
            } else {
              obj.subtitle = obj.message = err.message;
            }
            obj.locale = req.i18n.locale;
            res.render('single', obj);
          });
        });
      }
    });

  },
  resendEmail: function (req, res, next) {
    const __ = req.i18n.__.bind(req.i18n);
    const email = req.query.email;
    const that = this;
    const obj = {};
    co(function *() {
      const result = yield base.func.verifyUserAsync(req.admin.token, {email: email});
      const user = result.user;
      if (!result.exist) {
        return Promise.reject({code: 404, message: 'UserNotExist'});
      } else if (!user) {
        return Promise.reject({code: 500, message: 'SystemError'});
      } else if (user.enabled) {
        obj.message = obj.subtitle = __('api.register.Enabled');
        return base.func.render({req, res, next, view: 'single', content: obj, code: 400});
      }
      const token = yield base.func.emailTokenMemAsync(user, that.memcachedClient, __);

      const href = `${req.protocol}://${req.hostname}/auth/register/enable?user=${user.id}&token=${token}`;
      yield sendEmailAsync(
        user.email,
        __('api.register.UserEnable'),
        `
        <p><a href="${href}">${__('api.register.clickHereToEnableYourAccount')}</a></p>
        <p>${__('api.register.LinkFailedCopyTheHref')}</p>
        <p>${href}</p>
        `,
        req.admin.kikiRemote,
        req.admin.token
      );

      obj.subtitle = obj.message = __('api.register.SendSuccess');
      base.func.render({req, res, next, view: 'single', content: obj});

    }).catch((err) => {
      base.func.render({
        req, res, next,
        view: 'single',
        err
      });
    });
  },


  initRoutes: function () {

    this.app.get('/auth/register/*', base.middleware.adminLogin);
    this.app.post('/auth/register/*', base.middleware.adminLogin);

    this.app.get('/auth/register/success', this.regSuccess.bind(this));
    this.app.get('/auth/register/enable', this.enable.bind(this));
    this.app.get('/auth/register/change-email', this.changeEmail.bind(this));
    this.app.post('/auth/register/change-email/phone', this.getPhoneCaptchaForChangeEmail.bind(this));
    this.app.post('/auth/register/change-email', this.changeEmailSubmit.bind(this));
    this.app.get('/auth/register/resend-email', this.resendEmail.bind(this));

    this.app.post('/api/register', base.middleware.adminLogin, this.reg.bind(this));
    this.app.post('/api/register/*', base.middleware.adminLogin);

    this.app.post('/api/register/phone', this.verifyPhone.bind(this));
    this.app.post('/api/register/email', this.email.bind(this));
    this.app.post('/api/register/unique-name', this.uniqueName.bind(this));
    this.app.post('/api/register/unique-email', this.uniqueEmail.bind(this));

    this.app.use('/api/register', base.middleware.customRes);
    this.app.use('/api/register/*', base.middleware.customRes);
  }
};

module.exports = User;
