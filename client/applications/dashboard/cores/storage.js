/**
 * distributed united-storage used as cache
 * 当收到消息，通知storage更新数据，当数据更新后，通知具体的module更新
 */

const RSVP = require('rsvp');
const Promise = RSVP.Promise;
const msgEvent = require('./msg_event');

const instance = require('../modules/instance/cache');
const image = require('../modules/image/cache');
const port = require('../modules/port/cache');
const floatingip = require('../modules/floating-ip/cache');
const keypair = require('../modules/keypair/cache');
const network = require('../modules/network/cache');
const router = require('../modules/router/cache');
const securitygroup = require('../modules/security-group/cache');
const snapshot = require('../modules/snapshot/cache');
const subnet = require('../modules/subnet/cache');
const volume = require('../modules/volume/cache');
const loadbalancer = require('../modules/loadbalancer/cache');
const pool = require('../modules/resource-pool/cache');
const listener = require('../modules/loadbalancer/cache');
const healthmonitor = require('../modules/resource-pool/cache');
const member = require('../modules/resource-pool/cache');
const vpnservice = require('../modules/router/cache');
const ipsec = require('../modules/router/cache');
const ikepolicy = require('../modules/ike-policy/cache');
const ipsecpolicy = require('../modules/ipsec-policy/cache');
const notification = require('../modules/notification/cache');
const alarm = require('../modules/alarm/cache');
const orchestration = require('../modules/heat-list/cache');
const resourcetype = require('../modules/template-resource/cache');
const templateversion = require('../modules/template-version/cache');
const templatelist = require('../modules/template-list/cache');

const map = {
  network: ['subnet'],
  subnet: ['network', 'port'],
  port: ['subnet', 'instance'],
  router: ['subnet', 'port', 'network'],
  floatingip: ['instance', 'port'],
  instance: ['port', 'volume', 'image'],
  image: ['instance']
};

function Storage() {
  let that = this;
  this.cache = [];
  msgEvent.on('message', function(data) {
    let type = data.resource_type,
      list = [];

    if (map[type]) {
      list = map[type].concat(type);
    } else {
      list = [type];
    }

    that.getList(list, true).then(function() {
      msgEvent.emit('dataChange', data);
    });
  });
}

Storage.prototype = {
  getList: function(typeList, forced) {
    let that = this,
      promises = {};

    typeList.forEach((type) => {
      if (!forced) {
        if (that.cache[type]) {
          promises[type] = new Promise(function(resolve, reject) {
            resolve(that.cache[type]);
          });
          return;
        }
      }
      promises[type] = that['get' + type[0].toUpperCase() + type.slice(1) + 'List']().then(function(data) {
        that.cache[type] = data;
        return data;
      });

    });

    return RSVP.hash(promises);
  }

};

Object.assign(Storage.prototype, instance, image, port, floatingip, keypair, network, router, securitygroup,
  snapshot, subnet, volume, loadbalancer, pool, listener, healthmonitor, member, vpnservice, ipsec, ikepolicy,
  ipsecpolicy, notification, alarm, orchestration, resourcetype, templateversion, templatelist);

module.exports = new Storage();
