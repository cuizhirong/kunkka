'use strict';

const request = require('superagent');
const getQueryString = require('helpers/getQueryString.js');

function Driver() {
}

Driver.prototype.getMethod = function (url, token, callback, query) {
  let search = getQueryString(query);
  request
    .get(url + search)
    .set('X-Auth-Token', token)
    .end(callback);
};

Driver.prototype.putMethod = function (url, token, callback, theBody) {
  request
    .put(url)
    .send(theBody)
    .set('X-Auth-Token', token)
    .end(callback);
};

Driver.prototype.postMethod = function (url, token, callback, theBody) {
  if (token) {
    request
      .post(url)
      .send(theBody)
      .set('X-Auth-Token', token)
      .end(callback);
  } else {
    request
      .post(url)
      .send(theBody)
      .end(callback);
  }
};

module.exports = Driver;
