'use strict';

// const ApiBase = require('../../api/base.js');
const EventEmitter = require('events');
const apiList = require('./apilist.js');
const metaData = apiList.metaData;

const __ = function (output, callback) {
  return callback(this.triggerError ? {status: 500, output: 'Error test.'} : null, output);
};

const store = {};

/*
  mock async.js.
*/
const async = {};

/* mock async.parallel, which is a synchronous method at present. */
async.parallel = function (tasks, callback) {
  let results = [];
  let stop = false;
  let taskLength = tasks.length;
  let cb = function (index, err, output) {
    /* if no error occurred in previous tasks, continue do the task. */
    if (!stop) {
      /* collect response of each task by order. */
      results[index] = output;
      /* if error occurs in current task, just stop subsequent tasks. */
      if (err) {
        stop = true;
        return callback(err, results);
      } else if (index === taskLength - 1) {
        /* call 'callback' after the last task. */
        return callback(null, results);
      }
    }
  };
  tasks.forEach( (task, index) => {
    task(cb.bind(this, index));
  });
};

/* mock async.waterfall, which is a synchronous method at present. */
async.waterfall = function (tasks, callback) {
  let taskIndex = 0;
  let taskLength = tasks.length;
  let cb;
  let doTask;
  /* 'cb' is a replace of 'callback', as we can choose to call task or 'callback'. */
  cb = function () {
    let args = [];
    for (let _len = arguments.length, _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    let err = args[0];
    if (err) {
      /* if error occurs, call 'callback'. */
      callback(err);
    } else if (taskLength > taskIndex) {
      /* or call next task if exists. */
      args.shift();
      args.push(cb);
      taskIndex++;
      doTask.apply(undefined, args);
    }
  };
  doTask = function () {
    let args = [];
    for (let _len = arguments.length, _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (taskIndex === 0) {
      /* only one parameter in first task. */
      tasks[taskIndex](cb);
    } else if (taskLength > taskIndex) {
      /* arguments include injection of previous task and 'cb' in other task. */
      args.push(cb);
      tasks[taskIndex].apply(tasks, args);
    } else {
      /* arguments include error and injection of previous task in 'callback'. */
      args.unshift(null);
      callback.apply(undefined, args);
    }
  };
  doTask(cb);
};

/*
  mock express.js.
*/
function App(apiPath) {
  this.apiPath = apiPath;
  let session;
  let destroy = () => {
    this.req.session = session;
  };
  session = {
    cookie: {
    },
    destroy: destroy
  };
  this.req = {
    cookies: {
    },
    session: session
  };
  this.res = {
    testResult: {},
    status: (s) => {
      if (s) {
        this.res.testResult.status = s;
      }
      return this.res;
    },
    send: (s) => {
      if (s) {
        this.res.testResult.output = s;
      }
      return this.res;
    },
    json: (s) => {
      return this.res.send.call(this, s);
    },
    cookie: (name, val, opt) => {
      this.req.cookies[name] = val;
    },
    redirect: (s) => {
      console.log(`Redirection ${s} is being called!`);
    }
  };
}

App.prototype.next = function () {};

/* mock http request by adding a listener while event name is the api path to each request method object. */
App.prototype.method = function (type, apiPath, callback) {
  let eventListener = () => {
    /* reset testResult before send request. */
    this.res.testResult = {};
    return callback.call(this, this.req, this.res, this.next);
  };
  this[type + 'Event'].on(apiPath, eventListener);
  return eventListener;
};

['get', 'post', 'put'].forEach( s => {
  App.prototype[s + 'Event'] = new EventEmitter();
  App.prototype[s] = function (apiPath, callback) {
    return this.method(s, apiPath, callback);
  };
});

/*
  mock base.js.
*/
function Base(arrServiceObject) {
  if (arrServiceObject) {
    this.arrAsync = (objVar) => {
      let list = [];
      arrServiceObject.forEach( s => list.push(this['__' + s].bind(this, objVar)) );
      return list;
    };
  }
  if (this.initRoutes) {
    this.initRoutes();
  }
}

Base.prototype.getVars = function (req, arr) {
  let objVar = {};
  objVar.query = req.query;
  if (req.params && req.params.projectId) {
    objVar.projectId = req.params.projectId;
  }
  return objVar;
};

/* mock 'error handler' by printing the errors. */
Base.prototype.handleError = function (err, req, res) {
  return res.status(500).json(err);
};

/* mock 'sort list by time', which is the same as it used to be. */
Base.prototype.orderByCreatedTime = function (arr, flag) {
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
};

/* mock 'initialize routers', which is the same as it used to be. */
Base.prototype.__initRoutes = function (callback) {
  callback();
  if (this.addRoutes) {
    this.addRoutes(this.app);
  }
};

Base.prototype.__unscopedAuth = function (objVar, callback) {
  let name = objVar.username;
  let pass = objVar.password;
  if (metaData[name] === undefined) {
    return callback('Error user!');
  } else if (metaData[name].pass !== pass) {
    return callback('Error password!');
  }
  store._userName = name;
  store._userToken = `user-token-${name}-123`;
  store._userId = metaData[name].userId;
  let response = {
    header: {
      'x-subject-token': store._userToken
    },
    body: {
      token: {
        user: {
          id: store._userId
        }
      }
    }
  };
  return callback(null, response);
};

Base.prototype.__scopedAuth = function (objVar, callback) {
  let projectId = objVar.projectId;
  let token = objVar.token;
  let response = {};
  let error = null;
  if (store._userToken === token || store._projectToken === token) {
    store._projectToken = `project-token-${projectId}-123`;
    response = {
      header: {
        'x-subject-token': store._projectToken
      },
      body: {
        token: {
          expires_at: '2016-04-23T05:14:21.664Z',
          project: {
            id: projectId
          },
          user: {
            name: store._userName,
            id: store._userId
          },
          roles: [
            {
              name: 'admin'
            }, {
              name: 'member'
            }
          ],
          catalog: metaData.catalog
        }
      }
    };
    error = null;
  } else {
    error = 'Error token!';
  }
  return callback(error, response);
};

Base.prototype.__userProjects = function (objVar, callback) {
  let userId = objVar.userId;
  let token = objVar.token;
  let response = {};
  let error = null;
  if (store._userToken === token && store._userId === userId) {
    response = {
      projects: metaData[store._userName].projects
    };
    error = null;
  } else {
    error = 'Error token!';
  }
  return callback(error, response);
};

/* mock drivers' response.
 * case 'get', response with the default one in apilist.js.
 * case 'put', response with the one merged by request body.
 * case 'post', response with processed request data.
 */
Object.keys(apiList.list).forEach( s => {
  Base.prototype[s] = function(objVar, callback) {
    let response = JSON.parse(JSON.stringify(apiList.list[s]));
    return __.call(this, response, callback);
  };
});

Object.keys(apiList.putList).forEach( m => {
  Object.keys(apiList.putList[m]).forEach( s => {
    Base.prototype[s] = function(objVar, callback) {
      let response = apiList.putList[m][s];
      let body = objVar[m + 'Body'];

      /* Not support deep copy temporarily, since which is not necessary for present test. */
      Object.assign(response, body);
      return __.call(this, response, callback);
    };
  });
});

module.exports = {
  app: App,
  base: Base,
  async: async
};
