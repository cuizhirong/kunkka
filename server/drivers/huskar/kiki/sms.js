'use strict';

const Base = require('../base.js');
const driver = new Base();

driver.sendSms = function (countryCode, mobileNumber, content, remote, token, callback) {
  return driver.postMethod(
    remote + '/v1/publish/publish_sms',
    token,
    callback,
    {country_code: countryCode, mobile_number: mobileNumber, content: content}
  );
};

/*** Promise ***/
driver.sendSmsAsync = function (countryCode, mobileNumber, content, remote, token) {
  return driver.postMethodAsync(
    remote + '/v1/publish/publish_sms',
    token,
    {
      country_code: countryCode,
      mobile_number: mobileNumber,
      content: content
    }
  );
};

module.exports = driver;
