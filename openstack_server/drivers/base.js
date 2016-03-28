var request = require('superagent');

function Driver(service) {
}

var makeQueryForGetMethod = function (query) {
  var str = '';
  if (query) {
    Object.keys(query).forEach(function (k) {
      if (str) {
        str += '&';
      }
      str += k + '=' + query[k];
    });
  }
  str = str ? ('?' + str) : '';
  return str;
};

Driver.prototype.getMethod = function (url, token, callback, query) {
  var search = makeQueryForGetMethod(query);
  request
    .get(url + search)
    .set('X-Auth-Token', token)
    .end(callback);
};

module.exports = Driver;
