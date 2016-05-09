'use strict';

const async = require('async');
const mysql = require('mysql');
const logger = require('middlewares/logger').logger;

const driver = {
};
/*
  "fieldCount": 0,
  "affectedRows": 1,
  "insertId": 0,
  "serverStatus": 2,
  "warningCount": 0,
  "message": "",
  "protocol41": true,
  "changedRows": 0
 */

 /* handle with cache. */
function sortCache(cache) {
  let objCache = {};
  for (let i = 0, l = cache.length; i < l; i++) {
    if ( !objCache[cache[i].app] ) {
      objCache[cache[i].app] = [];
    }
    objCache[cache[i].app].push(cache[i]);
  }
  return objCache;
}

function toHandle(dataHandle, callback) {
  if (driver.connection._losted) {
    driver.reconnect(function (err, con) {
      if (err) {
        callback(err);
      } else {
        dataHandle(callback, null);
      }
    });
  } else {
    dataHandle(callback, null);
  }
}

function handleData(refresh, dataHandle, callback) {
  if (!refresh && driver.cacheClient) {
    driver.cacheClient.get('settings', function (err, cache) {
      if (err || cache === null) {
        toHandle(dataHandle, callback);
      } else {
        dataHandle(callback, JSON.parse(cache));
      }
    });
  } else {
    toHandle(dataHandle, callback);
  }
}

function findAll(next, cache) {
  if (cache) {
    next(null, cache);
  } else {
    let sql = `SELECT * FROM ${driver.table}`;
    driver.connection.query(sql, (err, result) => {
      if (err) {
        next(err);
      } else {
        if (driver.cacheClient) {
          driver.cacheClient.set('settings', JSON.stringify(sortCache(result)));
        }
        next(null, sortCache(result));
      }
    });
  }
}

function findAllByApp(name, next, cache) {
  if (cache) {
    if (cache[name]) {
      next(null, cache[name]);
    } else {
      next(null, []);
    }
  } else {
    let sql = `SELECT * FROM ${driver.table} WHERE app='${name}'`;
    driver.connection.query(sql, (err, result) => {
      if (err) {
        next(err);
      } else {
        next(null, result);
      }
    });
  }
}

function findOneById(id, next, cache) {
  if (cache) {
    let back = '';
    Object.keys(cache).some( s => {
      cache[s].some( t => {
        return (t.id === id) && (back = t);
      });
      return back;
    });
    next(null, back);
  } else {
    let sql = `SELECT * FROM ${driver.table} WHERE id=${id}`;
    driver.connection.query(sql, (err, result) => {
      if (err) {
        next(err);
      } else {
        next(null, result[0]);
      }
    });
  }
}

function createOne(set, next) {
  let sql = `INSERT INTO ${driver.table} SET ?`;
  driver.connection.query(sql, set, (err, result) => {
    if (err) {
      next(err);
    } else {
      findAll(next, null);
    }
  });
}

function updateOneById(id, set, next) {
  let sql = `UPDATE ${driver.table} SET ? WHERE id=${id}`;
  driver.connection.query(sql, set, (err, result) => {
    if (err) {
      next(err);
    } else if (result.affectedRows) {
      findAll(next, null);
    } else {
      next(404);
    }
  });
}

function deleteOneById(id, next) {
  let sql = `DELETE FROM ${driver.table} WHERE id=${id}`;
  driver.connection.query(sql, (err, result) => {
    if (err) {
      next(err);
    } else if (result.affectedRows) {
      findAll(next, null);
    } else {
      next(404);
    }
  });
}

driver.connectMysql = function connectMysql(con, next) {
  con.connect(function(err) {
    next(err, con);
  });
};

driver.createDatabse = function createDatabse(con, database, next) {
  con.query(`CREATE DATABASE ${database}`, function (err, result) {
    if (err) {
      if (err.errno === 1007) { // conflict
        console.log(`Databse ${database} already exists!`);
        next(null, con);
      } else {
        next(err, con);
      }
    } else {
      console.log(`Create database ${database} successfully.`);
      next(null, con);
    }
  });
};

driver.switchDatabase = function switchDatabase(con, database, next) {
  con.query(`USE ${database}`, function (err, result) {
    if (err) {
      next(err, con);
    } else {
      console.log(`switch ${database} successfully.`);
      next(null, con);
    }
  });
};

driver.createTable = function createTable(con, table, sets, next) {
  let options = [];
  Object.keys(sets.item).forEach( k => {
    options.push(k + ' ' + sets.item[k]);
  });
  con.query(`CREATE TABLE ${table}( ${options.join(',')}, ${sets.spec} )`, function (err) {
    if (err) {
      if (err.errno === 1050) { // conflict
        console.log(`Table ${table} already exists!`);
        driver.addTableKeys(con, table, sets.item, next);
      } else {
        next(err, con);
      }
    } else {
      console.log(`Create table ${table} successfully.`);
      next(null, con);
    }
  });
};

driver.addTableKeys = function addTableKeys(con, table, sets, next) {
  let keys = Object.keys(sets);
  let existKeys = [];
  let altList = [];
  con.query(`describe ${table}`, function (err, result) {
    if (err) {
      return next(err, con);
    }
    /* if column does not exist, add it. */
    result.forEach( e => {
      existKeys.push(e.Field);
    });
    keys.forEach( e => {
      if (existKeys.indexOf(e) === -1) {
        altList.push(`ADD ${e} ${sets[e]}`);
      }
    });
    if (altList.length) {
      con.query(`ALTER TABLE ${table} ${altList.join(',')}`, function (error) {
        next(error, con);
      });
    } else {
      next(null, con);
    }
  });
};

driver.connect = function connect(option, database, callback) {
  /* define reconnect. */
  driver.reconnect = driver.connect.bind(undefined, option, database);
  /* init sql connection. */
  let connection = mysql.createConnection(option);
  connection._errno = '';
  connection._losted = true;
  /* connection flow. */
  async.waterfall([
    (cb) => {
      driver.connectMysql(connection, cb);
    },
    (con, cb) => {
      driver.createDatabse(con, database, cb);
    },
    (con, cb) => {
      driver.switchDatabase(con, database, cb);
    }
  ], function (err, con) {
    if (err) {
      con._errno = err.errno;
      if (err.errno === 'ECONNREFUSED') {
        con._losted = true;
        console.log('Failed: sql connection failed!');
        logger.error(err);
        // driver.reconnect(callback);
      } else {
        console.log(err);
      }
    } else {
      console.log(`Mysql connected ${option.host} as id ${con.threadId}`);
      con._losted = false;
      /* case mysql connection lost. */
      con.on('error', function(error) {
        if (!error.fatal) {
          return;
        }
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
          con._losted = true;
          console.log('Failed: sql connection break off! \n ...try reconnecting...');
          /* save log for lost connection. */
          logger.error(error);
          driver.reconnect(callback);
        }
      });
    }
    driver.connection = connection = con;
    /* attach logger to connection. */
    connection._logger = logger;
    /* do async. */
    if (callback && typeof callback === 'function') {
      callback(err, connection);
    }
  });
};

/* handle with data. */
driver.getAllSettings = function (cb, refresh) {
  return handleData(refresh, findAll, cb);
};

driver.getSettingsByApp = function (name, cb, refresh) {
  return handleData(refresh, findAllByApp.bind(undefined, name), cb);
};

driver.getSettingById = function (id, cb, refresh) {
  return handleData(refresh, findOneById.bind(undefined, id), cb);
};

driver.createSetting = function (set, cb) {
  return handleData(true, createOne.bind(undefined, set), cb);
};

driver.updateSettingById = function (id, set, cb) {
  return handleData(true, updateOneById.bind(undefined, id, set), cb);
};

driver.deleteSettingById = function (id, cb) {
  return handleData(true, deleteOneById.bind(undefined, id), cb);
};

module.exports = driver;
