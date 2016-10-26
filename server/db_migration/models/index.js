'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require(__dirname + '/../../../configs/server.json');
const db = {};

const mysqlConfig = config.mysql;
const sequelize = new Sequelize(mysqlConfig.database, mysqlConfig.user, mysqlConfig.password, {
  host: mysqlConfig.host,
  port: mysqlConfig.port,
  dialect: 'mysql',
  logging: true
});

const apiPath = path.join(__dirname, '../../api');
fs
  .readdirSync(apiPath)
  .filter(dir => dir.indexOf('.') === -1)
  .forEach(apiModule => {
    let modelPath = path.join(apiPath, apiModule, 'models');
    try {
      fs.accessSync(modelPath, fs.R_OK);
      fs
        .readdirSync(modelPath)
        .filter(file => file !== 'index.js' && file.indexOf('.') !== 0)
        .forEach(file => {
          let model = sequelize.import(path.join(modelPath, file));
          db[model.name] = model;
        });
    } catch (e) {
      console.log(`${apiModule} has no models`);
    }
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
console.log(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
