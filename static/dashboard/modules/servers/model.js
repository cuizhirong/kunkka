'use strict';
var EventEmitter = require('eventemitter2');
var $ = require('jquery');
class Model extends EventEmitter {
    constructor() {
        super();
    }
    getServers() {
        var xhr = $.ajax({
            url: '/servers',
            method: 'GET'
        });
        xhr.done((function(res) {
            console.log(res);
        }).bind(this));
        xhr.fail((function(xhr, error, msg) {
            this.emit('serversFailed', xhr.status, xhr.responseJSON);
        }).bind(this));
    }
}

module.exports = Model;