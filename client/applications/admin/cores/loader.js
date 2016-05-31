/**
 * @func load modules dynamically
 */
var configs = require('../config.json');
var modules = {};

if (!HALO.configs.renderer) { // Do not load modules in server-end
  configs.modules.forEach((m) => {
    m.items.forEach((n) => {
      modules[n] = require('../modules/' + n + '/model');
    });
  });
}

module.exports = {
  configs: configs,
  modules: modules
};
