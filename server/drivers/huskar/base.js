'use strict';

const request = require('superagent');
const getQueryString = require('helpers/getQueryString.js');

function Driver(service) {
}

Driver.prototype.getMethod = function (url, token, callback, query) {
  let search = getQueryString(query);
  request
    .get(url + search)
    .set('X-Auth-Token', token)
    .end(callback);
};

module.exports = Driver;
