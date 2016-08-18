var storage = require('client/applications/approval/cores/storage');
// var fetch = require('client/applications/approval/cores/fetch');
// var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['Apply'], forced).then(function(data) {
      return data.Apply;
    });
  }
};
