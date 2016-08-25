'use strict';

const fs = require('fs');
const path = require('path');
const execFileSync = require('child_process').execFileSync;

const clientAppDir = path.join(__dirname, '..', 'client', 'applications');
const serverApiDir = path.join(__dirname, '..', 'server', 'api');
const serverDriverDir = path.join(__dirname, '..', 'server', 'drivers');
const serverPluginDir = path.join(__dirname, '..', 'server', 'plugins');
const rootDir = path.join(__dirname, '..');
const scriptPath = path.join(__dirname, 'pre_commit_hook.sh');

console.log('ADD ESLINT HOOK JOB: Start');

[clientAppDir, serverApiDir, serverDriverDir, serverPluginDir].forEach(p => {
  fs.readdirSync(p)
    .filter(d => fs.statSync(path.join(p, d)).isDirectory() && d.indexOf('.') === -1)
    .forEach(m => execFileSync(scriptPath, [rootDir], {
      'cwd': path.join(p, m)
    }));
});

console.log('ADD ESLINT HOOK JOB: Done!');
