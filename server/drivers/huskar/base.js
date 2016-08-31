'use strict';

const request = require('superagent');
const getQueryString = require('helpers/getQueryString.js');

function Driver() {
}

Driver.prototype.noServices = Array.from(require('config')('no_services') || []);

Driver.prototype.getMethod = function (url, token, callback, query) {
  let search = getQueryString(query);
  request
    .get(url + search)
    .set('X-Auth-Token', token)
    .end(callback);
};

Driver.prototype.headMethod = function (url, token, callback, query) {
  let search = getQueryString(query);
  request
    .head(url + search)
    .set('X-Auth-Token', token)
    .end(callback);
};

Driver.prototype.putMethod = function (url, token, callback, theBody) {
  if (theBody) {
    request
      .put(url)
      .send(theBody)
      .set('X-Auth-Token', token)
      .end(callback);
  } else {
    request
      .put(url)
      .set('X-Auth-Token', token)
      .end(callback);
  }
};

Driver.prototype.patchMethod = function (url, token, callback, theBody) {
  if (theBody) {
    request
      .patch(url)
      .send(theBody)
      .set('X-Auth-Token', token)
      .end(callback);
  } else {
    request
      .patch(url)
      .set('X-Auth-Token', token)
      .end(callback);
  }
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
