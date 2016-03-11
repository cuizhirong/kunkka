/*
* merge all nova api methods to one object and export it
*/
// module.exports = require('helpers/merge_methods')({}, __dirname);


module.exports = {
  server   : require('./instance'),
  keypair  : require('./keypair')
};
