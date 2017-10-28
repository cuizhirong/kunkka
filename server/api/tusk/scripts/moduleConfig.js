'use strict';

const fs = require('fs');
const path = require('path');


function getModuleConfig() {
  const moduleDict = {};
  const clientAppPath = path.join(__dirname, '../../../../client/applications');
  fs.readdirSync(clientAppPath)
    .forEach( a => {
      let config = {};
      try {
        config = require(path.join(clientAppPath, a, 'config.json'));
        moduleDict[a] = {};
        config.modules.forEach( m => {
          m.items.forEach(i => {
            moduleDict[a][i] = true;
          });
        });
        if (config.default_hide_modules) {
          config.default_hide_modules.forEach(h => moduleDict[a][h] = false);
        }
      } catch (e) {
        console.log(e.code);
      }
    });
  return moduleDict;
}

module.exports = getModuleConfig;
