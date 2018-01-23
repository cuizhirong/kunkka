'use strict';

const urlencode = require('urlencode');
const request = require('superagent');
const _ = require('lodash');
const hl95Config = require('config')('hl95');
const logger = require('middlewares/logger').logger;

const url = hl95Config.host;
const queryOptions = _.omit(hl95Config, 'host');
const driver = {};
driver.smsAsync = (phone, message) => {
  return new Promise((resolve, reject) => {
    request.get(url).query(
      Object.assign({}, queryOptions,
        {phone, message: urlencode(message, 'gb2312')}
      )
    ).end((err, result) => {
      let smsLog = `SENDSMS ${new Date().toLocaleString()} ${phone} ${message}`;
      if (err) {
        smsLog = smsLog + ` RESULT:ERROR ${err.toString()}`;
      } else {
        smsLog = smsLog + ` RESULT:${result.text}`;
      }
      logger.info(smsLog);

      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = driver;
