/* init assets directory in /opt diretory */
'use strict';

const fs = require('fs');
const config = require('config');
const assetsDir = config('assets_dir') || '/opt/assets';
fs.access(assetsDir, fs.R_OK | fs.W_OK, (err) => {
  if (err) {
    fs.mkdir(assetsDir, (_err) => {
      if (_err) {
        console.log(_err);
      } else {
        console.log(`Create assets directory ${assetsDir} successfully!`);
      }
    });
  } else {
    console.log(`Assets directory ${assetsDir} already exists`);
  }
});
