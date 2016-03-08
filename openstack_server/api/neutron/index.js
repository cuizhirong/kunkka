/*
* merge all neutron api methods to one object and export it
*/
// module.exports = require('helpers/merge_methods')({}, __dirname);

module.exports = {
  floatingip : require('./floatingip'),
  network    : require('./network'),
  port       : require('./port'),
  router     : require('./router'),
  subnet     : require('./subnet')
};
