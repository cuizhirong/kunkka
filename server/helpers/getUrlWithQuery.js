'use strict';

const getQueryString = require('./getQueryString');

module.exports = function (url, query) {

  let queryString = getQueryString(query);
  if (queryString) {
    if (url.indexOf('?') > -1) {
      url = url + '&' + queryString.splice(1);
    } else {
      url = url + queryString;
    }
  }

  return url;
};
