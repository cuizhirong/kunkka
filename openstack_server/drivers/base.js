var request = require('superagent');
var getQueryString = require('middlewares/getQueryString.js');

function Driver(service) {
}

Driver.prototype.getMethod = function (url, token, callback, query) {
  var search = getQueryString(query);
  request
    .get(url + search)
    .set('X-Auth-Token', token)
    .end(callback);
};

module.exports = Driver;
