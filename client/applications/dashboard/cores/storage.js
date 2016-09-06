/**
 * distributed united-storage used as cache
 * 当收到消息，通知storage更新数据，当数据更新后，通知具体的module更新
 */

var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var msgEvent = require('./msg_event');

var instance = require('../modules/instance/cache');
var image = require('../modules/image/cache');
var port = require('../modules/port/cache');
var floatingip = require('../modules/floating-ip/cache');
var keypair = require('../modules/keypair/cache');
var network = require('../modules/network/cache');
var router = require('../modules/router/cache');
var securitygroup = require('../modules/security-group/cache');
var snapshot = require('../modules/snapshot/cache');
var subnet = require('../modules/subnet/cache');
var volume = require('../modules/volume/cache');
var loadbalancer = require('../modules/loadbalancer/cache');
var pool = require('../modules/resource-pool/cache');
var listener = require('../modules/loadbalancer/cache');
var healthmonitor = require('../modules/resource-pool/cache');
var member = require('../modules/resource-pool/cache');
var vpnservice = require('../modules/router/cache');
var ipsec = require('../modules/router/cache');
var ikepolicy = require('../modules/ike-policy/cache');
var ipsecpolicy = require('../modules/ipsec-policy/cache');

var map = {
  network: ['subnet'],
  subnet: ['network', 'port'],
  port: ['subnet', 'instance'],
  router: ['subnet', 'port', 'network'],
  floatingip: ['instance', 'port'],
  instance: ['port', 'volume', 'image'],
  image: ['instance']
};

function Storage() {
  var that = this;
  this.cache = [];
  msgEvent.on('message', function(data) {
    var type = data.resource_type,
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
    var that = this,
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

Object.assign(Storage.prototype, instance, image, port, floatingip, keypair, network, router, securitygroup, snapshot, subnet, volume, loadbalancer, pool, listener, healthmonitor, member, vpnservice, ipsec, ikepolicy, ipsecpolicy);

module.exports = new Storage();
