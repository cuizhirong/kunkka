'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports.hash = (originalPassword) => new Promise((resolve, reject) => {
  bcrypt.hash(originalPassword, saltRounds, (err, hashValue) => (err ? reject(err) : resolve(hashValue)));
});

module.exports.compare = (originalPassword, hashPassword) => new Promise((resolve, reject) => {
  bcrypt.compare(originalPassword, hashPassword, (err, same) => (err ? reject(err) : resolve(same)));
});
