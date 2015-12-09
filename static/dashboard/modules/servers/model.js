var EventEmitter = require('eventemitter2');
var $ = require('jquery');
class Model extends EventEmitter {
  constructor() {
    super();
  }
  getServers() {
    var that = this;
    var xhr = $.ajax({
      url: '/servers',
      method: 'GET'
    });
    xhr.done(function(res) {
      console.log(res);
    });
    xhr.fail(function(xhr, error, msg) {
      that.emit('serversFailed', xhr.status, xhr.responseJSON);
    });
  }
}

module.exports = Model;
