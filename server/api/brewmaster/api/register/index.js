'use strict';
const Promise = require('bluebird');
const uuid = require('uuid');
const async = require('async');

const regModel = require('../../models').register;
const drivers = require('drivers');

const config = require('config');
const region = config('region');
const regionId = (region && region[0] && region[0].id) || 'RegionOne';
const keystoneRemote = config('keystone');
const domain = config('domain') || 'Default';
const tokenExpire = config('reg_token_expire') || 60 * 60 * 24;
const smsExpire = config('reg_sms_expire') || 60 * 10;
const corporationName = config('reg_corporation_name');

const adminLogin = require('api/slardar/common/adminLogin');

let createUser = Promise.promisify(drivers.keystone.user.createUser);
let getUser = Promise.promisify(drivers.keystone.user.getUser);
let updateUser = drivers.keystone.user.updateUser;
let listUsers = drivers.keystone.user.listUsers;
let createProject = drivers.keystone.project.createProject;
let addRoleToUserOnProject = drivers.keystone.role.addRoleToUserOnProject;
let listRoles = drivers.keystone.role.listRoles;

let memcachedClient, memcachedGet;

function User (app) {
  this.app = app;
  memcachedClient = app.get('CacheClient');
  memcachedGet = Promise.promisify(memcachedClient.get.bind(memcachedClient));
}


User.prototype = {

  _adminLogin: function (req, res, next) {
    adminLogin(function (err, result) {
      if (err) {
        next(err);
      } else {
        req.admin = {token: result.token, kikiRemote: result.remote.kiki[regionId]};
        next();
      }
    });
  },

  reg: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    let that = this;
    const needed = ['name', 'password', 'email', 'phone', 'code'];
    const lack = [];
    needed.forEach(item=> {
      req.body[item] || lack.push(item);
    });
    if (lack.length) {
      return res.status(500).send(__('api.register.MissParams'), lack.join());
    }
    //keystone
    Promise.props({
      email: Promise.promisify(that._verifyEmail)(req.admin.token, req.body.email),
      name: Promise.promisify(that._verifyName)(req.admin.token, req.body.name)
    })
      .then(function (used) {
        let msg = [];
        for (let key in used) {
          if (used[key]) {
            msg.push(key);
          }
        }

        if (msg.length) {
          return Promise.reject(msg.join() + ' have been used');
        }

        let phone = parseInt(req.body.phone, 10);

        if (!(/^1[34578]\d{9}$/.test(phone))) {
          return Promise.reject(__('api.register.PhoneError'));
        }

        return memcachedGet(phone.toString());
      })
      .then(function (codeRes) {
        let code = parseInt(req.body.code, 10);
        if (codeRes && codeRes[0] && JSON.parse(codeRes[0].toString()).code === code) {

          return Promise.all([
            regModel.findOne({where: {email: req.body.email}}),
            regModel.findOne({where: {phone: req.body.phone}})
          ]);
        } else {
          return Promise.reject(__('api.register.CodeError'));
        }
      })
      .then(result=> {
        return Promise.map(result, function (user) {
          if (user) {
            return user.destroy();
          }
        });
      })
      //Keystone
      .then(function () {
        return createUser(req.admin.token, keystoneRemote, {
          user: {
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
            domain_id: domain,
            enabled: false
          }
        });
      })

      //MySQL
      .then(function (result) {
        let user = result.body.user;
        if (user.links) {
          user.links = JSON.stringify(user.links);
        }
        user.phone = req.body.phone;

        return regModel.create(user);

      })

      //memcached
      .then(function (user) {
        that._sendEmail(user, req, res, next);
      })
      .catch(next);

  },

  enable: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    let token = req.query.token;
    let userId = req.query.user;

    regModel.findOne({
      where: {userId: userId}
    }).then(function (user) {
      if (!user) {
        return Promise.reject(__('api.register.UserNotExist'));
      } else if (user.enabled) {
        return getUser(req.admin.token, keystoneRemote, user.id).then((userKeystone)=> {
          if (userKeystone.body.user.enabled) {
            return Promise.props({enabled: true});
          } else {
            return Promise.props({user: user, token: memcachedGet(userId)});
          }
        })
      } else {
        return Promise.props({user: user, token: memcachedGet(userId)});
      }
    }).then(function (result) {
      if (result && result.enabled === true) {
        return res.status(500).send(__('api.register.Enabled'));
      }
      let tokenGet = result.token && result.token[0] && result.token[0].toString();
      let user = result.user;
      if (tokenGet === token) {

        async.waterfall([
          (callback)=> {
            async.parallel([
              (cb)=> {
                createProject(
                  req.admin.token,
                  keystoneRemote,
                  function (err, response) {
                    if (err || !response.body.project) {
                      cb(err || __('api.register.ProjectCreateError'));
                    } else {
                      let projectId = response.body.project.id;
                      cb(null, projectId);
                    }
                  },
                  {project: {name: user.name + '_project'}}
                )
              },
              (cb)=> {
                listRoles(req.admin.token, keystoneRemote, function (err, response) {
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
                }, {name: 'billing_owner'})
              }
            ], function (err, results) {
              if (err) {
                callback(err);
              } else {
                let projectId = results[0];
                let roleId = results[1];
                callback(null, projectId, roleId);
              }
            })
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
              })
          },
          (cb)=> {
            updateUser(req.admin.token,
              keystoneRemote,
              user.id,
              {user: {enabled: true}},
              function (err, resEnable) {
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
              user.save().then(function (resultSave) {
                cb(null, resultSave);
              }).catch(cb)
            }
          }
        ], (err, resultSave) => {
          if (err) {
            next(err);
          } else {
            memcachedClient.set(user.userId, tokenGet, function () {
              res.send(resultSave);
            }, 1);
          }
        })

      } else {
        res.status(500).send(__('api.register.LinkError'));
      }
    }).catch(next);
  },

  email: function (req, res, next) {
    let phone = req.body.phone;
    let email = req.body.email;
    let __ = req.i18n.__.bind(req.i18n);
    let that = this;

    regModel.findOne({
      where: {
        email: email,
        phone: phone
      }
    }).then(user=> {
      if (!user) {
        return Promise.reject(__('api.register.UserNotExist'));
      } else {
        return getUser(req.admin.token, keystoneRemote, user.id);
      }
    }).then(userKeystone=> {
      if (userKeystone.enabled) {
        user.enabled = true;
        user.save().then(()=> {
          res.send(__('api.register.Enabled'));
        }).catch(next);
      } else {
        user.enabled = false;
        user.save().then(()=> {
          that._sendEmail(user, req, res, next);
        }).catch(next);
      }
    }).catch(next);

  },
  _sendEmail: function (user, req, res, next) {
    let token = uuid.v4();
    let __ = req.i18n.__.bind(req.i18n);

    memcachedClient.set(user.userId, token, function (errSet, val) {
      if (errSet) {
        next(errSet);
      } else {
        //Send Email
        drivers.kiki.email.sendEmail(
          user.email,
          __('api.register.UserEnable'),
          encodeURI(`${req.protocol}://${req.hostname}/api/register/enable?user=${user.userId}&token=${token}`),
          req.admin.kikiRemote,
          req.admin.token,
          function (err, result) {
            if (err) {
              next(err);
            } else {
              res.send(__('api.register.SendSuccess'));
            }
          }
        );
      }
    }, tokenExpire);

  },
  verifyPhone: function (req, res, next) {
    let __ = req.i18n.__.bind(req.i18n);
    let phone = parseInt(req.body.phone, 10);

    if (!(/^1[34578]\d{9}$/.test(phone))) {
      res.status(500).send(__('api.register.PhoneError'));
      return false;
    }


    regModel.findOne({where: {phone: phone}})
      .then(user=> {

        if (user) {
          res.status(500).send(__('api.register.Phone') + phone + __('api.register.Used'));
        } else {
          memcachedGet(phone.toString()).then(function (result) {
            if (result[0]) {
              result = JSON.parse(result[0].toString());
              if (new Date().getTime() - result.time < 60000) {
                return res.send(__('api.register.Frequently'));
              }
            }
            let val = {
              code: Math.random() * 900000 | 100000,
              time: new Date().getTime()
            };
            memcachedClient.set(phone.toString(), JSON.stringify(val), function (err) {
              if (err) {
                next(err);
              } else {
                drivers.kiki.sms.sendSms(
                  '86',
                  phone.toString(),
                  `【${corporationName}】 校验码是 ${val.code},5分钟内有效`,
                  req.admin.kikiRemote,
                  req.admin.token,
                  function (errSend) {
                    if (errSend) {
                      memcachedClient.set(phone.toString(), JSON.stringify({}), function (err) {
                        next(errSend);
                      }, 1)
                    } else {
                      res.send(__('api.register.SendSuccess'));
                    }
                  }
                );

              }
            }, smsExpire);

          })
        }
      }).catch(next);
  },

  uniqueEmail: function (req, res, next) {
    let email = req.body.email;

    this._verifyEmail(req.admin.token, email, function (err, used) {
      if (err) {
        next(err);
      } else if (used) {
        res.status(400).send('this email has been used');
      } else {
        res.send('this email is available');
      }
    });
  },


  /**
   * @param adminToken
   * @param email
   * @param callback 接受两个参数:err和used
   */
  _verifyEmail: function (adminToken, email, callback) {
    if (typeof callback === 'function') {
      regModel.findOne({email: email})
        .then(user=> {
          if (user) {
            listUsers(adminToken, keystoneRemote, function (err, result) {

              if (err) {
                callback(err);
              } else {
                let users = result.body.users;

                if (users.length) {
                  callback(null, true);
                } else {
                  user.destroy().then(function () {
                    callback(null, false);
                  }).catch(callback);
                }
              }
            }, {name: user.name});

          } else {
            callback(null, false);
          }
        })
        .catch(callback);
    }
  },
  uniqueName: function (req, res, next) {
    let name = req.body.name;
    this._verifyName(req.admin.token, name, function (err, used) {
      if (err) {
        next(err);
      } else if (used) {
        res.status(400).send('name has been used.');
      } else {
        res.send('name is available');
      }
    });
  },

  /**
   * @param adminToken
   * @param name
   * @param callback 接受两个参数:err和used
   */
  _verifyName: function (adminToken, name, callback) {
    if (typeof callback === 'function') {
      listUsers(adminToken, keystoneRemote, function (err, result) {
        if (err) {
          callback(err);
        } else {
          let users = result.body.users;
          if (users.length) {
            callback(null, true);
          } else {
            regModel.destroy({where: {name: name}})
              .then(function () {
                callback(null, false);
              })
              .catch(callback);
          }
        }
      }, {name: name});
    }
  },

  initRoutes: function () {
    this.app.post('/api/register', this._adminLogin.bind(this), this.reg.bind(this));
    this.app.get('/api/register/enable', this._adminLogin.bind(this), this.enable.bind(this));
    this.app.post('/api/register/phone', this._adminLogin.bind(this), this.verifyPhone.bind(this));
    this.app.post('/api/register/email', this._adminLogin.bind(this), this.email.bind(this));
    this.app.post('/api/register/unique-name', this._adminLogin.bind(this), this.uniqueName.bind(this));
    this.app.post('/api/register/unique-email', this._adminLogin.bind(this), this.uniqueEmail.bind(this));
    this.app.post('/api/register/test/login', this._adminLogin.bind(this));
  }
};

module.exports = User;
