/*
 * Author: Jiangqi
 * Updated by: yaoli
 */

var EventEmitter = require('eventemitter2');

if (EventEmitter.EventEmitter2) {
  EventEmitter = EventEmitter.EventEmitter2;
}

class RouterModel extends EventEmitter {
  constructor() {
    super();

    window.onpopstate = this.onChangeState.bind(this);
  }

  onChangeState(event) {
    this.emit('changeState', this.getPathList());
  }

  // Title is ignored by browser
  pushState(url, obj, title) {
    if (url === window.location.pathname) {
      return;
    }
    window.history.pushState(obj, title, url);
    this.onChangeState();
  }

  replaceState(url, obj, title) {
    if (url === window.location.pathname) {
      return;
    }
    window.history.replaceState(obj, title, url);
    this.onChangeState();
  }

  getPathList() {
    var path = window.location.pathname;

    return path.split('/').filter((m) => {
      return m ? true : false;
    });
  }
}

var ret = {};
try {
  if (window) {
    ret = new RouterModel();
  }
} catch (e) {
  console.log(e);
}

module.exports = ret;
