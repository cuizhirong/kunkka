var EventEmitter = require('eventemitter');
var $ = require('jquery');
class Model extends EventEmitter {
    constructor() {
        super();
    }
    login(username, password) {
        var xhr = $.ajax({
            url: '/auth/login',
            method: 'POST',
            data: {
                username: username,
                password: password
            }
        });
        xhr.done((function(res) {
            this.emit('loginDone');
        }).bind(this));
        xhr.fail((function(xhr, error, msg) {
            this.emit('loginFailed', xhr.status, xhr.responseJSON);
        }).bind(this));
    }
}

module.exports = Model;