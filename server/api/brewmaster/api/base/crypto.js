'use strict';

const bcrypt = require('bcrypt');
const cryptoJS = require('crypto-js');
const saltRounds = 10;

module.exports.hash = (originalPassword) => new Promise((resolve, reject) => {
  bcrypt.hash(originalPassword, saltRounds, (err, hashValue) => (err ? reject(err) : resolve(hashValue)));
});

module.exports.compare = (originalPassword, hashPassword) => new Promise((resolve, reject) => {
  bcrypt.compare(originalPassword, hashPassword, (err, same) => (err ? reject(err) : resolve(same)));
});

module.exports.encrypt = (str, secretKey) => {
  return cryptoJS.AES.encrypt(str, secretKey);
};

module.exports.decrypt = (ciphertext, secretKey) => {
  return cryptoJS.AES.decrypt(ciphertext.toString(), secretKey).toString(cryptoJS.enc.Utf8);
};
