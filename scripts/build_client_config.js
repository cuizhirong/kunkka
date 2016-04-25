'use strict';

const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const clientAppsPath = path.join(__dirname, '..', 'client', 'applications');
fs.readdirSync(clientAppsPath)
  .filter( m => fs.statSync(path.join(clientAppsPath, m)).isDirectory())
  .forEach( a => {
    let appPath = path.join(clientAppsPath, a);
    exec('cp config.json.sample config.json', {cwd: appPath}, (err, stdout, stderr) => {
      if (err) {
        console.log(`${appPath} has no config.json.sample file.`);
      }
    });
  });
