'use strict';

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const execSync = child_process.execSync;
const execFileSync = child_process.execFileSync;

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
        let checkoutCmd = a.branch[env] === 'master' ? 'git checkout master' : `git checkout tags/${a.branch[env]} -b ${a.branch[env]}`;
        execSync(`git clone ${a.git} ${a.name} && ${checkoutCmd}`, {'cwd': path.join(__dirname, a.directory)});
        execFileSync(path.join(__dirname, 'pre_commit_hook.sh'), [rootDir], {
          'cwd': appDir
        });
        console.log(`add eslint pre-commit hook in project ${a.project}`);
      }
    } catch (e) {
      console.error(e);
    }
  });
});

try {
  execFileSync(path.join(__dirname, 'csc.sh'));
} catch (e) {
  console.log(e);
}

console.log('Assembled all applications!');
