'use strict';

const Base = require('../base.js');
const driver = new Base();


/*** Promise ***/

driver.createSubscriptionAsync = function (opt = {}) {
  return driver.postMethodAsync(
    `${opt.remote}/v2/queues/${opt.queue_name}/subscriptions`,
    opt.token,
    opt.payload,
    opt.header
  );
};

module.exports = driver;
