'use strict';

const qs = require('querystring');

module.exports = function (query) {
  var str = '';
  if (query) {
    Object.keys(query).forEach(function (k) {
      if (str) {
        str += '&';
      }
      str += k + '=' + qs.escape(query[k]);
    });
    str = str ? ('?' + str) : '';
  }

  return str;
};
