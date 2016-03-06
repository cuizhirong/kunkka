/**
 * united-storage used as cache
 */

var RSVP = require('rsvp');
var Promise = RSVP.Promise;
// var notification = require('client/uskin/index').Notification;

var instance = require('../modules/instance/cache');
var image = require('../modules/image/cache');

function Storage() {
  window.cache = this.cache = [];
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
        // notification.addNotice({
        //   title: 'Note:',
        //   showIcon: true,
        //   content: 'I am a notification',
        //   type: 'success',
        //   isAutoHide: true,
        //   id: 6
        // });
        that.cache[type] = data;
        return data;
      });

    });

    return RSVP.hash(promises);
  },

  getSingleData: function(type, forced) {}

};

Object.assign(Storage.prototype, instance, image);

module.exports = new Storage();
