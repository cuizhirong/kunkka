var EventEmitter = require('eventemitter2');
var $ = require('jquery');
class Model extends EventEmitter {
  constructor() {
    super();
  }
  login(username, password) {
    var that = this;

    var xhr = $.ajax({
      url: '/auth/login',
      method: 'POST',
      data: {
        username: username,
        password: password
      }
    });

    xhr.done(function(res) {
      that.emit('loginDone');
    });

    xhr.fail(function(xhr, error, msg) {
      that.emit('loginFailed', xhr.status, xhr.responseJSON);
    });
  }
}

module.exports = Model;
