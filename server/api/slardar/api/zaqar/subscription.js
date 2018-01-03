'use strict';

const co = require('co');

const drivers = require('drivers');
const config = require('config');
const adminProjectId = config('admin_projectId');
const keystoneRemote = config('keystone');

const oneDay = 1000 * 60 * 60 * 24;
const adminLogin = require('../../common/adminLogin');
const Base = require('../base.js');
const {createTrustAsync, deleteTrustAsync, getTrustAsync} = drivers.keystone.trust;
const {createSubscriptionAsync} = drivers.zaqar.queues;

function Keypair (app) {
  this.app = app;
  this.memClient = app.get('CacheClient');
  Base.call(this);
}
Keypair.prototype = {
  createSubscription: function (req, res, next) {
    const that = this;
    const memClient = that.memClient;
    co(function* () {
      const endpoint = req.session.endpoint;
      const ssUser = req.session.user;
      const userToken = ssUser.token;
      const queueName = req.params.queueName;

      const _create = function* () {
        let subscriber = req.body.subscriber;
        let cache = yield memClient.getAsync(`subscriptionProject${ssUser.projectId}Queue${queueName}${subscriber}`);
        if (cache[0]) return;
        yield createSubscriptionAsync({
          token: ssUser.token,
          remote: endpoint.zaqar[ssUser.regionId],
          queue_name: queueName,
          payload: req.body,
          header: {
            'Client-ID': req.header('Client-ID')
          }
        });
        yield memClient.setAsync(`subscriptionProject${ssUser.projectId}Queue${queueName}${subscriber}`, subscriber, 120);
      };

      if (adminProjectId === ssUser.projectId) {
        yield _create();
        res.end();
        return;
      }

      let needCreateTrust = false;
      //get trust
      let trustId = yield memClient.getAsync(`trustIdForZaqar_${ssUser.projectId}`);
      trustId = trustId[0];
      let trust;
      if (trustId) {
        try {
          trust = yield getTrustAsync(userToken, keystoneRemote, trustId);
          trust = trust.body.trust;
        } catch (e) {
          if (e.statusCode === 404) {
            yield memClient.deleteAsync(`trustIdForZaqar_${ssUser.projectId}`);
            needCreateTrust = true;
          } else {
            throw e;
          }
        }
      } else {
        needCreateTrust = true;
      }

      //judge trust || delete trust
      if (trust && (!trust.expires_at || new Date(trust.expires_at) - new Date() < oneDay)) {
        needCreateTrust = true;
        yield deleteTrustAsync(userToken, keystoneRemote, trust.id);
        yield memClient.deleteAsync(`trustIdForZaqar_${ssUser.projectId}`);
      }

      //create trust
      if (needCreateTrust) {
        let adminLoginResult = yield adminLogin();
        trust = yield createTrustAsync(userToken, keystoneRemote, {
          trust: {
            trustee_user_id: adminLoginResult.response.body.token.user.id,
            trustor_user_id: ssUser.userId,
            expires_at: (new Date(new Date().getTime() + 30 * oneDay).toISOString()),
            impersonation: true,
            project_id: ssUser.projectId,
            allow_redelegation: true,
            roles: [{name: ssUser.roles[0]}]
          }
        });
        trust = trust.body.trust;
        yield memClient.setAsync(`trustIdForZaqar_${ssUser.projectId}`, trust.id);
      }

      yield _create();
      res.end();
    }).catch(e => {
      next(e);
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.post('/api/zaqar/v2/queues/:queueName/subscriptions', this.createSubscription.bind(this));
    });
  }
};

Object.assign(Keypair.prototype, Base.prototype);

module.exports = Keypair;
