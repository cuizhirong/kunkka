'use strict';

const request = require('superagent');
const getQueryString = require('helpers/getQueryString.js');
const remote = require('config')('remote');

function Driver(service) {
  this.remote = remote[service];
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

module.exports = Driver;
