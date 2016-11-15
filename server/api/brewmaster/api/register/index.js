'use strict';
const Promise = require('bluebird');
const async = require('async');

const userModel = require('../../models').user;
const drivers = require('drivers');
const base = require('../base');
const config = require('config');
const keystoneRemote = config('keystone');
const domainName = config('domain') || 'Default';

let createUser = Promise.promisify(drivers.keystone.user.createUser);
let getUser = Promise.promisify(drivers.keystone.user.getUser);
let updateUser = drivers.keystone.user.updateUser;
let createProject = drivers.keystone.project.createProject;
let listProjects = drivers.keystone.project.listProjects;
let addRoleToUserOnProject = drivers.keystone.role.addRoleToUserOnProject;
let listRoles = drivers.keystone.role.listRoles;
let listDomains = Promise.promisify(drivers.keystone.domain.listDomains);

let memcachedClient, memcachedGet;

function User (app) {
  this.app = app;
  memcachedClient = app.get('CacheClient');
  memcachedGet = Promise.promisify(
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
    needed.forEach(item=> {
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
    listDomains(req.admin.token, keystoneRemote, {name: domainName, enabled: true}).then((domainRes)=> {
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
    }).then((used)=> {
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

      return memcachedGet(phone.toString());
    })
      .then((codeRes)=> {
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
      .then(result=> {
        return Promise.map(result, (user)=> {
          if (user) {
            return user.destroy();
          }
        });
      })
      //Keystone
      .then(()=> {
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
      .then((result)=> {
        let user = result.body.user;
        if (user.links) {
          user.links = JSON.stringify(user.links);
        }
        user.phone = req.body.phone;
        user.area_code = config('phone_area_code') || '86';

        return userModel.create(user);
      })

      //memcached
      .then((user)=> {
        that._sendEmail(user, req, (err)=> {
          if (err) {
            next(err);
          } else {
            res.json({type: 'message', message: __('api.register.SendSuccess')});
          }
        });
      })
      .catch(err=> {
        next(err);
      });

  },

  enable: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    let token = req.query.token;
    let userId = req.query.user;

    userModel.findOne({
      where: {userId: userId}
    }).then((user)=> {
      if (!user) {
        return Promise.reject({
          customRes: true,
          status: 404,
          type: 'NotFound',
          message: __('api.register.UserNotExist')
        });
      } else if (user.enabled) {
        return getUser(req.admin.token, keystoneRemote, user.id).then((userKeystone)=> {
          if (userKeystone.body.user.enabled) {
            return Promise.props({enabled: true});
          } else {
            return Promise.props({user: user, token: memcachedGet(userId)});
          }
        });
      } else {
        return Promise.props({user: user, token: memcachedGet(userId)});
      }
    }).then((result)=> {
      if (result && result.enabled === true) {
        return Promise.reject({customRes: true, type: '', message: __('api.register.Enabled')});
      }
      let tokenGet = result.token && result.token[0] && result.token[0].toString();
      tokenGet = JSON.parse(tokenGet).token;
      let user = result.user;
      if (tokenGet === token) {

        async.waterfall([
          (callback)=> {
            async.parallel([
              (cb)=> {
                createProject(
                  req.admin.token,
                  keystoneRemote,
                  (err, response)=> {

                    if (err && err.status === 409) {
                      listProjects(req.admin.token, keystoneRemote, (errList, projects)=> {
                        if (errList) {
                          cb(errList);
                        } else {
                          let projectExist = projects.body.projects[0];
                          cb(null, projectExist && projectExist.id);
                        }
                      }, {name: user.name + '_project'});

                    } else if (err) {
                      cb(err);
                    } else {
                      let projectId = response.body.project.id;
                      cb(null, projectId);
                    }
                  },
                  {project: {name: user.name + '_project'}}
                );
              },
              (cb)=> {
                listRoles(req.admin.token, keystoneRemote, (err, response)=> {
                  if (err || !response.body.roles) {
                    cb(err || response.body);
                  } else {
                    let roles = response.body.roles;
                    let roleId = '';
                    roles.some(role=> {
                      return (role.name === 'billing_owner') && (roleId = role.id );
                    });

                    cb(null, roleId);
                  }
                }, {name: 'billing_owner'});
              }
            ], (err, results)=> {
              if (err) {
                callback(err);
              } else {
                let projectId = results[0];
                let roleId = results[1];
                callback(null, projectId, roleId);
              }
            });
          },
          (projectId, roleId, cb)=> {
            addRoleToUserOnProject(projectId,
              user.id,
              roleId,
              req.admin.token,
              keystoneRemote,
              (err)=> {
                if (err) {
                  cb(err);
                } else {
                  cb();
                }
              });
          },
          (cb)=> {
            updateUser(req.admin.token,
              keystoneRemote,
              user.id,
              {user: {enabled: true}},
              (err, resEnable)=> {
                if (err) {
                  cb(err);
                } else {
                  cb(null, resEnable);
                }
              }
            );
          },
          (resultEnable, cb)=> {
            if (resultEnable) {
              user.enabled = true;
              user.save().then((resultSave)=> {
                cb(null, resultSave);
              }).catch(cb);
            }
          }
        ], (err) => {
          if (err) {
            base.func.getTemplateObj((errObj, obj)=> {
              if (errObj) {
                obj.subtitle = obj.message = __('api.register.SystemError');
              } else {
                obj.subtitle = __('api.register.EnableFailed');
                if (err.customRes === true) {
                  obj.message = err.message;
                } else {
                  obj.message = __('api.register.SystemError');
                }
              }
              res.render('single', obj);
            });
          } else {
            memcachedClient.set(user.userId, tokenGet, ()=> {
              base.func.getTemplateObj((errObj, obj)=> {
                if (errObj) {
                  obj.subtitle = obj.message = __('api.register.SystemError');
                } else {
                  obj.subtitle = obj.message = __('api.register.EnableSuccess');
                }
                res.render('single', obj);
              });

            }, 1);
          }
        });

      } else {
        return Promise.reject({
          customRes: true,
          status: 400,
          type: 'Bad Request',
          message: __('api.register.LinkError')
        });
      }
    }).catch(err=> {
      base.func.getTemplateObj((errObj, obj)=> {
        if (errObj) {
          obj.subtitle = obj.message = __('api.register.SystemError');
        } else {
          obj.subtitle = __('api.register.EnableFailed');
          if (err.customRes === true) {
            obj.message = err.message;
          } else {
            obj.message = __('api.register.SystemError');
          }
        }
        res.render('single', obj);
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
    }).then(user=> {
      if (!user) {
        return Promise.reject({type: 'Conflict', location: 'email', message: __('api.register.UserNotExist')});
      } else {
        return Promise.props({
          userKeystone: getUser(req.admin.token, keystoneRemote, user.id),
          userDB: user
        });
      }
    }).then(result=> {
      let userKeystone = result.userKeystone;
      let userDB = result.userDB;
      if (userKeystone.enabled) {
        userDB.enabled = true;
        userDB.save().then(()=> {
          res.send({type: 'message', message: __('api.register.Enabled')});
        }).catch(err=> {
          next(__('api.register.SystemError'));
        });
      } else {
        userDB.enabled = false;
        userDB.save().then(()=> {
          that._sendEmail(userDB, req, (err)=> {
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
      let __ = req.i18n.__.bind(req.i18n);

      base.func.emailTokenMem(user, memcachedClient, __, (e, token)=> {
        if (e) {
          cb(e);
        } else {
          let href = `${req.protocol}://${req.hostname}/auth/register/enable?user=${user.userId}&token=${token}`;
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

    base.func.verifyUser(req.admin.token, {phone: phone}, (err, used)=> {
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

    base.func.verifyUser(req.admin.token, {email: email}, (err, used)=> {
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
    base.func.verifyByName(req.admin.token, name, (err, used)=> {
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
    let email = req.query.email;
    base.func.getTemplateObj((errObj, obj)=> {
      if (errObj) {

        obj.subtitle = obj.message = __('api.register.SystemError');
        res.status(500).render('single', obj);

      } else {
        obj.subtitle = __('api.register.registerSuccess');
        obj.email = email;
        obj.locale = req.i18n.locale;
        this._checkUserNotEnabled(req.admin.token, {email: email}, (err, result)=> {
          if (!err) {
            res.render('sendEmail', obj);
          } else if (err.message === 'Enabled') {
            obj.subtitle = obj.message = __('api.register.Enabled');
            res.status(err.code).render('single', obj);
          } else {
            obj.subtitle = obj.message = __('api.register.' + err.message);
            res.status(err.code).render('single', obj);
          }
        });
      }
    });


  },

  _checkUserNotEnabled: function (token, where, cb) {
    if (cb && typeof cb === 'function') {
      base.func.verifyUser(token, where, function (err, userExist, user) {
        if (err) {
          cb({code: 500, message: 'SystemError'});
        } else if (!userExist) {
          cb({code: 404, message: 'UserNotExist'});
        } else if (user) {
          if (user.enabled === true) {
            cb({code: 400, message: 'Enabled'});
          } else if (user.enabled === false) {
            cb(null, user);
          } else {
            cb({code: 500, message: 'SystemError'});
          }
        } else {
          cb({code: 500, message: 'SystemError'});
        }
      });
    }
  },

  changeEmail: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    let email = req.query.email;
    let msg = '';

    base.func.verifyUser(req.admin.token, {email: email}, (err, used, user)=> {
      if (err) {
        msg = __('api.register.SystemError');
      } else if (!used || !user) {
        msg = __('api.register.UserNotExist');
      } else if (user.enabled) {
        msg = __('api.register.Enabled');
      }

      base.func.getTemplateObj((errObj, obj)=> {
        if (msg || errObj) {
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

  changeEmailPhone: function (req, res, next) {

    let phone = req.body.phone;
    if (!(/^1[34578]\d{9}$/.test(phone))) {
      return res.status(500).send({type: 'message', message: __('api.register.PhoneError')});
    }
    base.func.verifyUser(req.admin.token, {phone: phone}, (err, result, user)=> {
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

    base.func.verifyUser(req.admin.token, {phone: phone}, (errVerify, used, u)=> {
      let msg = '';
      if (errVerify) {
        msg = __('api.register.SystemError');
      } else if (!used || !u) {
        msg = __('api.register.UserNotExist');
      } else if (u.enabled) {
        msg = __('api.register.Enabled');
      }

      if (msg) {
        base.func.getTemplateObj((errObj, obj)=> {
          obj.subtitle = obj.message = errObj ? __('api.register.SystemError') : msg;
          res.status(500).render('single', obj);
        });
      } else {

        memcachedGet(phone.toString()).then((codeRes)=> {
          if (codeRes && codeRes[0] && JSON.parse(codeRes[0].toString()).code === code) {
            return userModel.findOne({where: {phone: phone}});
          } else {
            return Promise.reject({status: 400, customRes: true, type: '', message: __('api.register.CodeError')});
          }
        }).then(user=> {

          if (!user) {
            return Promise.reject({status: 404, customRes: true, type: '', message: __('api.register.UserNotExist')});
          } else {
            user.email = email;
            return Promise.props({
              db: user.save(),
              keystone: Promise.promisify(updateUser)(req.admin.token, keystoneRemote, user.id, {user: {email: email}})
            });
          }
        }).then((result)=> {
          return that._sendEmail(result.db, req, (errSend)=> {
            if (errSend) {
              return Promise.reject(errSend);
            } else {
              return base.func.getTemplateObj((errObj, obj)=> {
                if (errObj) {
                  obj.subtitle = obj.message = __('api.register.SystemError');
                  res.status(500).render('single', obj);
                } else {
                  obj.locale = req.i18n.locale;
                  obj.subtitle = __('api.register.changeEmailSuccess');
                  obj.email = email;
                  res.render('sendEmail', obj);
                }
              });
            }
          });
        }).catch(err=> {
          base.func.getTemplateObj((errObj, obj)=> {
            if (errObj || !err.customRes) {
              obj.subtitle = obj.message = __('api.register.SystemError');
            } else {
              obj.subtitle = obj.message = err.message;
            }
            res.render('single', obj);
          });
        });
      }
    });

  },
  resend: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    let email = req.query.email;
    let that = this;

    this._checkUserNotEnabled(req.admin.token, {email: email}, (err, user)=> {
      base.func.getTemplateObj((errObj, obj)=> {
        if (errObj) {
          obj.message = obj.subtitle = __('api.register.SystemError');
          res.status(500).render('single', obj);
        } else if (err) {
          obj.message = obj.subtitle = __('api.register.' + err.message);
          res.status(err.code).render('single', obj);
        } else {
          that._sendEmail(user, req, (errSend)=> {
            if (errSend) {
              obj.subtitle = obj.message = __('api.register.SystemError');
            } else {
              obj.subtitle = obj.message = __('api.register.SendSuccess');
            }
            res.render('single', obj);
          });
        }
      });
    });
  },

  initRoutes: function () {

    this.app.get('/auth/register/*', base.middleware.adminLogin);
    this.app.post('/auth/register/*', base.middleware.adminLogin);

    this.app.get('/auth/register/success', this.regSuccess.bind(this));
    this.app.get('/auth/register/enable', this.enable.bind(this));
    this.app.get('/auth/register/change-email', this.changeEmail.bind(this));
    this.app.post('/auth/register/change-email/phone', this.changeEmailPhone.bind(this));
    this.app.post('/auth/register/change-email', this.changeEmailSubmit.bind(this));
    this.app.get('/auth/register/resend-email', this.resend.bind(this));

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
