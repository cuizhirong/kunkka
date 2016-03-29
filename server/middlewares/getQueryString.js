module.exports = function (query) {
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
