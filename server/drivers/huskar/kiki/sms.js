'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.sendSms = function (countryCode, mobileNumber, content, remote, token, callback) {
  return driver.postMethod(
    remote + '/v1/publish/publish_sms',
    token,
    callback,
    {country_code: countryCode, mobile_number: mobileNumber, content: content}
  );
};


module.exports = driver;
