'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const execSync = childProcess.execSync;
const execFileSync = childProcess.execFileSync;

const config = require('../../config');

const env = process.argv[2] || 'dev';

let clientAppDir = path.join(__dirname, '..', 'client', 'applications');
try {
  fs.accessSync(clientAppDir, fs.W_OK);
} catch (e) {
  fs.mkdirSync(clientAppDir);
}

Object.keys(config).forEach(key => {
  config[key].applications.forEach(a => {
    let appDir = path.join(__dirname, a.directory, a.name);
    let rootDir = path.join(__dirname, '..');
    try {
      try {
        fs.accessSync(path.join(__dirname, a.directory, a.name), fs.F_OK);
        console.log(`project ${a.project} already exists.`);
      } catch (e) {
        let checkoutCmd = env === 'dev' ? `git checkout ${a.branch[env]}` : `git checkout -b ${a.branch[env]} ${a.branch[env]}`;
        execSync(`git clone ${a.git} ${a.name} && cd ${a.name} && ${checkoutCmd}`, {'cwd': path.join(__dirname, a.directory)});
        execFileSync(path.join(__dirname, 'pre_commit_hook.sh'), [rootDir], {
          'cwd': appDir
        });
        console.log(`add eslint pre-commit hook in project ${a.project}`);
      }
    } catch (e) {
      console.error(e.toString());
    }
  });
});

try {
  execFileSync(path.join(__dirname, 'csc.sh'));
} catch (e) {
  console.log(e.toString());
}

console.log('Assembled all applications!');
