const Sequelize = require('sequelize');
const mysqlConfig = require('config')('mysql');

const sequelize = new Sequelize(mysqlConfig.database, mysqlConfig.user, mysqlConfig.password, {
  host: mysqlConfig.host,
  port: mysqlConfig.port,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  logging: false
});

const driver = {};
driver.mysql = sequelize;

module.exports = driver;
