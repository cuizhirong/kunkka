'use strict';

const driver = require('./driver');
const configMysql = require('config')('mysql');
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

module.exports = function(app) {
  app.use('/api/setting', function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      return res.status(401).json({error: req.i18n.__('api.auth.unauthorized')});
    }
  });

  driver.connect(sqlOption, databaseName, function (con) {
    driver.cacheClient = app.get('CacheClient');
    driver.table = tableName;
    driver.createTable(driver.connection, tableName, tableSet, function (err, conn) {
      if (err) {
        console.log(err);
      } else {
        console.log('tusk is ready.');
        require('./api')(app);
      }
    });
  });

  return app;
};
