'use strict';

const chalk = require('chalk');
const error = chalk.bgRed.white.bold;
const success = chalk.green.bold;
const warn = chalk.bgYellow.white.bold(' WARNING ');
const config = require('../../config.js');
const execSync = require('child_process').execSync;
const path = require('path');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const env = process.argv[2] || 'dev';

const applications = [];
Object.keys(config).forEach(c => {
  config[c].applications.forEach(a => {
    applications.push(a);
  });
});
applications.push({
  'project': 'halo',
  'name': 'halo',
  'branch': {
    'dev': 'master'
  },
  'directory': '../../'
})

function pullCode (apps) {
  let a = apps.pop();
  let project = chalk.bgBlue.white.bold(` ${a.name} `);
  console.log(`${project}: checking work space`);
  let appDir = path.join(__dirname, a.directory, a.name);
  let gsOutput = execSync('git status', {
    cwd: appDir
  });
  console.log(gsOutput.toString());
  rl.question(`${warn} ${chalk.yellow.bold('Are you sure to do a git pull in')} ${project}. Enter ${chalk.green.bold('yes')} to do a git pull (make sure the work space is clean!), press ${chalk.green.bold('Enter')} to skip this action: `, (answer) => {
    if (answer === 'yes') {
      let gp = execSync('git pull', {
        cwd: appDir
      });
      console.log(gp.toString());
      console.log(success(`git pull in ${a.name} is done!\n`));
    } else {
      console.log(chalk.cyan.bold(`Skip the project ${a.name}.\n`));
    }
    if (apps.length) {
      pullCode(apps);
    } else {
      rl.close();
    }
  });
}

pullCode(applications);


