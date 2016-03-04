// var novaRemote = require('config')('remote').nova;

var defaultMeta = {
};

var metadata = {
};

Object.defineProperty(metadata, 'default', {
  value        : defaultMeta,
  writable     : false,
  enumerable   : false,
  configurable : true
});

module.exports = metadata;
