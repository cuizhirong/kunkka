/**
 * @func load modules dynamically
 */
var configs = require('configs/index.json');

var modules = {};

configs.modules.forEach((m) => {
  modules[m] = require('../modules/' + m + '/model');
});


module.exports = {
  configs: configs,
  modules: modules
};
