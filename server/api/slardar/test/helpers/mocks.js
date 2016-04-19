'use strict';

// const ApiBase = require('../../api/base.js');
const EventEmitter = require('events');
const apiList = require('./apilist.js');

const __ = function (input, callback) {
  return callback(this.triggerError ? 'Error occurs.' : null, input);
};

const async = {
  parallel: function (arr, callback) {
    let results = [];
    let error = '';
    let _callback = function (err, output) {
      results.push(output);
      error = err;
    };
    arr.forEach( r => {
      r(_callback);
    });
    return callback(error, results);
  }
};

const App = function (apiPath) {
  this.apiPath = apiPath;
  this.req = {};
  this.res = {
    status: (s) => {
      return this.res;
    },
    json: (s) => {
      this.res.testResult = s;
      return this.res.testResult;
    }
  };
};

App.prototype = {
  getEvent: new EventEmitter(),
  next: function () {},
  get: function (_path, _callback) {
    let getEventTrigger = _callback.bind(this, this.req, this.res, this.next);
    this.getEvent.on(_path, getEventTrigger);
    return getEventTrigger;
  }
};

const Base = function (arrService, arrServiceObject) {
  this.arrAsync = [];
  /* get methods of show serviceObject list. */
  if (arrServiceObject) {
    arrServiceObject.forEach( s => this.arrAsync.push(this['__' + s].bind(this)) );
  }

  if (this.initRoutes) {
    this.initRoutes();
  }
};

Base.prototype = {
  getVars: function () {},
  handleError: function (err, req, res) {
    return res.json(err);
  },
  orderByCreatedTime: function (arr, flag) {
    // default is DESC.
    if (!arr.length) {
      return;
    }
    if (flag === undefined) {
      flag = 'DESC';
    }
    if (['ASC', 'DESC'].indexOf(flag) === -1) {
      throw new Error('parameter flag must be ASC or DESC.');
    } else {
      let comparision = '';
      let pool = ['created', 'created_at'];
      pool.some(function (k) {
        return (arr[0][k] !== undefined) && (comparision = k);
      });
      if (!comparision) {
        return;
      } else {
        arr.sort(function (a, b) {
          return (new Date(b[comparision]) - new Date(a[comparision]));
        });
        if (flag === 'ASC') {
          arr.reverse();
        }
      }
    }
  },
  __initRoutes: function (callback) {
    callback();
    if (this.addRoutes) {
      this.addRoutes(this.app);
    }
  }
};

Object.keys(apiList).forEach( s => {
  Base.prototype[s] = function(callback) {
    return __.call(this, JSON.parse(JSON.stringify(apiList[s])), callback);
  };
});

module.exports = {
  app: App,
  base: Base,
  async: async
};
