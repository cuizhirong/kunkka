/**
 * 对一些只需要请求一遍的数据进行缓存
 */

const RSVP = require('rsvp');
const Promise = RSVP.Promise;

const instance = require('../modules/instance/cache');

function Storage() {
  this.cache = {};
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

      promises[type] = that['get' + type[0].toUpperCase() + type.slice(1)]().then(function(data) {
        that.cache[type] = data;
        return data;
      });

    });

    return RSVP.hash(promises);
  }

};

Object.assign(Storage.prototype, instance);

module.exports = new Storage();
