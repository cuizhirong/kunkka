'use strict';

const fs = require('fs');
const exec = require('child_process').exec;
const path = require('path');
const clientPath = path.join(__dirname, '../client');
const assetsPath = path.join(clientPath, 'assets');
const applicationsPath = path.join(clientPath, 'applications');


fs.readdirSync(applicationsPath)
  .filter(application => fs.statSync(path.join(applicationsPath, application)).isDirectory())
  .forEach(application => {
    let app = application;
    fs.access(path.join(applicationsPath, app, 'assets'), fs.R_OK, (err) => {
      if (err) {
        console.log(`${app} has no assets directory`);
      } else {
        exec(`rm -rf ${assetsPath}/${app} && cp -r ${path.join(applicationsPath, app, 'assets')}/ ${assetsPath}/${app}/`, {
          cwd: path.join(applicationsPath, app)
        }, (_err) => {
          if (_err) {
            console.log(_err);
          } else {
            console.log(`done for ${app} assets!`);
          }
        });
      }
    });
  });
