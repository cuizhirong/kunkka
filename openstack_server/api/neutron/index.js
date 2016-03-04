/*
* merge all neutron api methods to one object and export it
*/
// module.exports = require('helpers/merge_methods')({}, __dirname);

module.exports = {
  floatingip : require('./floatingip'),
  network    : require('./network'),
  nic        : require('./nic'),
  router     : require('./router'),
  subnet     : require('./subnet')
};
