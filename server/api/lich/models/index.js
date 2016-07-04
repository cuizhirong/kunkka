'use strict';

const fs = require('fs');
const mysql = require('drivers').mysql;
const path = require('path');

const db = {};

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js')
  .forEach(file => {
    let model = mysql.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate !== undefined) {
    db[modelName].associate(db);
  }
});

db.mysql = mysql;
mysql.sync().then(() => {
  console.log('mysql sync done!');
}).catch(err => {
  console.log(err);
});

module.exports = db;
