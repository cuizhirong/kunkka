/*
 * Author: Jiangqi
 * Updated by: yaoli
 */

var EventEmitter = require('eventemitter2');

class RouterModel extends EventEmitter {
  constructor() {
    super();

    window.onpopstate = this.onPopState.bind(this);

  }

  onPopState(event) {
    this.emit('popState', this.getPathList());
  }

  // Title is ignored by browser
  pushState(url, obj, title) {
    window.history.pushState(obj, title, url);
    this.onPopState({});
  }

  getPathList() {
    var path = window.location.pathname;

    return path.split('/').filter((m) => {
      return m ? true : false;
    });
  }
}

module.exports = new RouterModel();
