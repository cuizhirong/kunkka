'use strict';

var EventEmitter = require('eventemitter2');

class RouterModel extends EventEmitter {
    constructor() {
        super();
        window.onpopstate = this.onPopState.bind(this);

        this.onPopState({});
    }
    onPopState(event) {
        this.emit('popState');
    }
    pushState(obj, title, url) {
        window.history.pushState(obj, title, url);
        this.onPopState({});
    }
    getCurrentView() {
        var path = window.location.pathname;
        var exec = /^\/app\/(\w+)/.exec(path);
        if (exec && exec.length > 1) {
            return exec[1];
        }
        return '';
    }
}

// This is a singleton class to handle the url issue.
if (!window.gRouterModel) {
    window.gRouterModel = new RouterModel();
}

module.exports = window.gRouterModel;