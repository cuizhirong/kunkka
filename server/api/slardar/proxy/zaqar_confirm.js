'use strict';


const request = require('superagent');
const co = require('co');
const uuid = require('uuid');

const customResPage = require('../../brewmaster/api/base').middleware.customResPage;
const adminLogin = require('../common/adminLogin');
const config = require('config');
const configRegion = config('region');
const keystoneRemote = config('keystone');

const adminProjectId = config('admin_projectId');
const regionId = (configRegion && configRegion[0] && configRegion[0].id) || 'RegionOne';
const drivers = require('drivers');

const {scopedAuthByTrustAsync} = drivers.keystone.trust;

module.exports = app => {
  app.get('/proxy-zaqar/confirm-subscriptions/email', function (req, res, next) {
    co(function* () {
      const urlProjectId = req.query.Project;
      const adminToken = yield adminLogin();
      const opts = {
        remote: adminToken.remote.zaqar[regionId],
        token: adminToken.token
      };

      if (adminProjectId !== urlProjectId) {
        const memClient = app.get('CacheClient');
        let trustId = yield memClient.getAsync(`trustIdForZaqar_${urlProjectId}`);
        if (!trustId[0]) {
          next({status: 500, message: req.i18n.__('api.keystone.confirmError')});
          return;
        }
        trustId = trustId[0].toString();
        let userToken = yield scopedAuthByTrustAsync(adminToken.token, trustId, keystoneRemote);
        opts.token = userToken.headers['x-subject-token'];
      }

      const target = opts.remote + req.query.Paths;
      request.put(target)
      .set('X-Auth-Token', opts.token)
      .set('Client-ID', uuid.v1())
      .send({confirmed: true})
      .end((err) => {
        if (err) {
          next({status: 500, message: req.i18n.__('api.keystone.confirmError')});
        } else {
          next({message: req.i18n.__('api.keystone.confirmSuccess')});
        }
      });
    }).catch(next);
  }, customResPage);
};
