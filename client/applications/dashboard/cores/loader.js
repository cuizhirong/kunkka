/**
 * @func load modules dynamically
 */
const configJson = require('../config.json');
const filter = require('client/libs/filter');
const configs = filter(configJson);

let modules = {};

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
