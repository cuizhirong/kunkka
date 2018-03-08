'use strict';

const co = require('co');

const crypto = require('crypto');

const tusk = require('api/tusk/dao');
const models = require('../../models');
const accountModel = models.video_account;

function Video(app) {
  this.app = app;
}

Video.prototype = {
  checkAdmin: function(req, res, next) {
    if (!(req.session && req.session.user && req.session.user.isAdmin)) {
      res.status(401).end();
      return;
    } else {
      next();
    }
  },
  //create cc account
  create: function(req, res, next) {
    co(function* () {
      const payload = {
        user_id: req.body.user_id,
        username: req.body.username,
        account_id: req.body.account_id
      };
      yield accountModel.create(payload);
      res.send('success');
    }).catch(next);
  },

  update: function(req, res, next) {
    const id = req.body.id;
    const payload = {};
    payload.user_id = req.body.user_id || undefined;
    payload.username = req.body.username || undefined;
    payload.account_id = req.body.account_id || undefined;
    co(function* () {
      yield accountModel.update(payload, {where: {id}});
      res.send('success');
    }).catch(next);
  },

  deleteAccount: function (req, res, next) {
    const id = req.body.id;
    co(function* () {
      yield accountModel.destroy({where: {id}});
      res.send('success');
    }).catch(next);
  },

  list: function(req, res, next) {
    co(function* () {
      const result = yield accountModel.findAll();
      res.json(result);
    }).catch(next);
  },

  redirect: function(req, res, next) {
    if (!(req.session && req.session.user)) {
      res.status(401).end();
      return;
    } else {
      const userId = req.session.user.userId;
      co(function* () {
        const account = yield accountModel.findOne({where: {user_id: userId}});
        if (account) {
          const uid = account.account_id;
          const settingObj = yield tusk.getSettingsByApp('video');
          let secretKey, url;
          settingObj.forEach(s => {
            if (s.name === 'secret_key') {
              secretKey = s.value;
            } else if (s.name === 'url') {
              url = s.value;
            }
          });
          const time = Date.now();
          const qs = `uid=${uid}&time=${time}&salt=${secretKey}`;
          const hash = crypto.createHash('md5').update(qs).digest('hex');
          const redirectUrl = `${url}?uid=${uid}&time=${time}&hash=${hash}`;
          res.json({
            hasAccount: true,
            redirectUrl: redirectUrl
          });
        } else {
          res.json({
            hasAccount: false
          });
        }
      }).catch(next);
    }
  },

  initRoutes: function() {
    this.app.post('/api/video/account', this.checkAdmin.bind(this), this.create.bind(this));
    this.app.get('/api/video/account', this.checkAdmin.bind(this), this.list.bind(this));
    this.app.put('/api/video/account', this.checkAdmin.bind(this), this.update.bind(this));
    this.app.delete('/api/video/account', this.checkAdmin.bind(this), this.deleteAccount.bind(this));
    this.app.get('/api/video/redirect', this.redirect.bind(this));
  }
};

module.exports = Video;
