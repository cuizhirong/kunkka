'use strict';

const fs = require('fs');

const dao = {};

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js')
  .forEach(file => {
    let daoName = file.split('.')[0];
    dao[daoName] = require(`./${daoName}`);
  });

module.exports = dao;
