'use strict';

const urlencode = require('urlencode');
const request = require('superagent');
const _ = require('lodash');
const hl95Config = require('config')('hl95');

const url = hl95Config.host;
const queryOptions = _.omit(hl95Config, 'host');
const driver = {};
driver.smsAsync = (phone, message) => {
  return request
    .get(url)
    .query(
      Object.assign(
        {},
        queryOptions,
        {
          phone,
          message: urlencode(message, 'gb2312')
        }
      )
    );
};

module.exports = driver;
