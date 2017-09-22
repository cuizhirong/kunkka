'use strict';

const qs = require('querystring');

module.exports = function (query) {
  let str = '';
  if (query) {
    Object.keys(query).forEach(function (k) {
      if (str) {
        str += '&';
      }
      if (Array.isArray(query[k])) {
        str += query[k].map(value => k + '=' + qs.escape(value)).join('&');
      } else {
        str += k + '=' + qs.escape(query[k]);
      }
    });
    str = str ? ('?' + str) : '';
  }

  return str;
};
