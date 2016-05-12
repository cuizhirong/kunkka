/* init table of row name and default value. */

'use strict';

console.log('---------------------------');

const path = require('path');
const async = require('async');
const mysql = require('mysql');
const sessionEngine = require('config')('sessionEngine');

const configMysql = require(path.join(__dirname, '../../../../configs/server.json')).mysql;

const databaseName = configMysql.database;
const tableName = configMysql.table;
const sqlOption = {
  host : configMysql.host,
  port : configMysql.port,
  user : configMysql.user,
  password : configMysql.password
};

const tableSet = {
  item: {
    id: 'int(8) not null primary key auto_increment',
    app: 'char(100) not null',
    name: 'char(100) not null',
    value: 'text',
    type: 'char(20) not null',
    description: 'text',
    create_at: 'datetime',
    update_at: 'timestamp'
  },
  spec: 'UNIQUE KEY app(app, name)'
};

const initSets = [
  {
    app: 'login',
    name: 'logo',
    value: '/static/assets/logo@2x.png',
    type: 'string'
  }, {
    app: 'login',
    name: 'company',
    value: '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号',
    type: 'string'
  }, {
    app: 'login',
    name: 'favicon',
    value: '/static/assets/favicon.ico',
    type: 'string'
  }, {
    app: 'admin',
    name: 'logo',
    value: '/static/assets/nav_logo.png',
    type: 'string'
  }, {
    app: 'admin',
    name: 'favicon',
    value: '/static/assets/favicon.ico',
    type: 'string'
  }, {
    app: 'dashboard',
    name: 'logo',
    value: '/static/assets/nav_logo.png',
    type: 'string'
  }, {
    app: 'dashboard',
    name: 'favicon',
    value: '/static/assets/favicon.ico',
    type: 'string'
  }, {
    app: 'admin',
    name: 'is_show_trash',
    value: 'false',
    type: 'boolean'
  }
];

let num = initSets.length;
let count = 0;
let sql = {};

/* handle sql. */

sql.connectMysql = function connectMysql(con, next) {
  con.connect(function(err) {
    next(err, con);
  });
};

sql.createDatabse = function createDatabse(con, database, next) {
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

sql.switchDatabase = function switchDatabase(con, database, next) {
  con.query(`USE ${database}`, function (err, result) {
    if (err) {
      next(err, con);
    } else {
      console.log(`Connection as mysql switch to ${database} successfully.`);
      next(null, con);
    }
  });
};

sql.connect = function connect(option, database, callback) {
  /* init sql connection. */
  let connection = mysql.createConnection(option);
  /* connection flow. */
  async.waterfall([
    (cb) => {
      sql.connectMysql(connection, function (err) {
        if (!err) {
          console.log('Connection as mysql connected at threadId: ' + connection.threadId);
        }
        cb(err, connection);
      });
    },
    (con, cb) => {
      sql.createDatabse(con, database, cb);
    },
    (con, cb) => {
      sql.switchDatabase(con, database, cb);
    }
  ], function (err, con) {
    if (err) {
      console.log(err);
    } else {
      sql.connection = connection = con;
      /* do async. */
      if (callback && typeof callback === 'function') {
        callback(err, connection);
      }
    }
  });
};

sql.addTableKeys = function addTableKeys(con, table, sets, next) {
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

sql.createTable = function createTable(con, table, sets, next) {
  let options = [];
  Object.keys(sets.item).forEach( k => {
    options.push(k + ' ' + sets.item[k]);
  });
  con.query(`CREATE TABLE ${table}( ${options.join(',')}, ${sets.spec} )`, function (err) {
    if (err) {
      if (err.errno === 1050) { // conflict
        console.log(`Table ${table} already exists!`);
        sql.addTableKeys(con, table, sets.item, next);
      } else {
        next(err, con);
      }
    } else {
      console.log(`Create as table ${table} successfully.`);
      next(null, con);
    }
  });
};

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

sql.createOne = function createOne(set, next) {
  let sentence = `INSERT INTO ${sql.table} SET ?`;
  sql.connection.query(sentence, set, next);
};

function updateMemcache(data, next) {
  let countClient = 0;
  let numClient = 0;
  let Memcached = require('memjs');
  sessionEngine.remotes.forEach( remote => {
    numClient++;
    let MemcachedClient = Memcached.Client.create(remote, {
      failover: true
    });
    MemcachedClient.set('settings', data, function(err) {
      if (!err) {
        console.log(`Cache updated at Memcache@${remote} successfully.`);
      } else {
        console.log(err.stack);
      }
      /* cut off connection to memcache. */
      MemcachedClient.close();
      countClient++;
      if (countClient === numClient) {
        next();
      }
    });
  });
}

sql.updateCache = function findAll(next) {
  let sentence = `SELECT * FROM ${tableName}`;
  sql.connection.query(sentence, (err, result) => {
    if (err) {
      next(err);
    } else {
      if (sessionEngine) {
        if (sessionEngine.type === 'Memcached') {
          updateMemcache(JSON.stringify(sortCache(result)), next);
        } else {
          console.log('redis is not supported yet.');
        }
      }
    }
  });
};

function initTable(sets, cb) {
  sets.forEach( e => {
    sql.createOne(e, function(err, result) {
      if (err) {
        if (err.errno === 1062) {
          console.log(`Row as \{app:"${e.app}",name:"${e.name}"\} already exist.  (not offer to update row, since the script intension)`);
        } else {
          console.log(err.message);
        }
      } else {
        console.log(`Row inserted ${JSON.stringify(e)} successfully.`);
      }
      count++;
      if (count === num) {
        /* update cache. */
        sql.updateCache(function() {
          /* cut off connection to mysql. */
          sql.connection.end(function (error) {
            if (error){
              console.log(error);
              sql.connection.destroy();
            } else {
              console.log('All done...\nConnection as mysql cut off at threadId!', sql.connection.threadId, '\n---------------------------');
            }
          });
        });
      }
    });
  });
}

if (num > 0) {
  sql.connect(sqlOption, databaseName, function (error, con) {
    sql.table = tableName;
    sql.createTable(sql.connection, tableName, tableSet, function (err, conn) {
      if (err) {
        console.log(err);
      } else {
        console.log(`Connection as mysql in ${databaseName} is ready.`);
        initTable(initSets, function () {});
      }
    });
  });
} else {
  console.log('no default data to initialization.');
}
