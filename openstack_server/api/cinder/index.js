/*
* merge all neutron api methods to one object and export it
*/
// module.exports = require('helpers/merge_methods')({}, __dirname);

module.exports = {
  snapshot: require('./snapshot'),
  volume: require('./volume')
};
