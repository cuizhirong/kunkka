'use strict';

const Base = require('../base.js');
const driver = new Base();

driver.sendEmail = function (to, subject, content, remote, token, callback) {
  return driver.postMethod(
    remote + '/v1/publish/publish_email',
    token,
    callback,
    {to: to, subject: subject, content: content}
  );
};

/*** Promise ***/
driver.sendEmailAsync = function (to, subject, content, remote, token) {
  return driver.postMethodAsync(
    remote + '/v1/publish/publish_email',
    token, {
      to: to,
      subject: subject,
      content: content
    }
  );
};

module.exports = driver;
