#!/usr/bin/env node

'use strict';

const path = require('path');
const execSync = require('child_process').execSync;
const readline = require('readline');
const chalk = require('chalk');
const config = require('../config');

let branch = process.argv[2] || 'master';
let tagPattern;
if (branch === 'stable/liberty') {
  tagPattern = '3.*.*';
}

const applications = config.applications;
applications.push({
  'project': 'halo',
  'name': 'halo',
  'branch': {
    'dev': branch
  },
  'directory': '../../'
});

function getNewTag(tag) {
  let tagArray = tag.split('.');
  tagArray[2] = parseInt(tagArray[2], 10) + 1;
  return tagArray.join('.');
}

function split(flag, version) {
  var result = [];
  if (flag) {
    var tail = version.split('-')[1];
    var _version = version.split('-')[0];
    result = _version.split('.');
    tail = tail.split('.');
    result = result.concat(tail);
  } else {
    result = version.split('.');
  }
  return result;
}

function convertToNumber(arr) {
  return arr.map(function(el) {
    return isNaN(el) ? el : parseInt(el, 10);
  });
}

function compare(v1, v2) {
  var flag1 = v1.indexOf('-') > -1 ? true : false;
  var flag2 = v2.indexOf('-') > -1 ? true : false;
  var arr1 = split(flag1, v1);
  var arr2 = split(flag2, v2);
  arr1 = convertToNumber(arr1);
  arr2 = convertToNumber(arr2);
  var len = Math.max(arr1.length, arr2.length);
  for (var i = 0; i < len; i++) {
    if (arr1[i] === undefined) {
      return -1;
    } else if (arr2[i] === undefined) {
      return 1;
    }
    if (arr1[i] > arr2[i]) {
      return 1;
    } else if (arr1[i] < arr2[i]) {
      return -1;
    }
  }
  return 0;
}

function updateTag(apps) {
  if (apps.length === 0) {
    console.log('RELEASE JOB is done!!! Please wait util Gerrit pushes all new tags to gitlab, then run "npm run tags" to update config.json');
    return;
  }
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>'
  });
  let a = apps.pop();
  let project = chalk.bgBlue.white.bold(` ${a.name} `);
  let appDir = path.join(__dirname, a.directory, a.name);
  try {
    let checkGitOutput = execSync('ls .git', {cwd: appDir});

    let listResult = checkGitOutput.toString();
    if (/No\ such\ file\ or \ directory/.test(listResult)) {
      console.log('The project ' + project + ' is not set. Please run npm run assemble first.');
      // Since some project is not initlized. The pull action is not necessary to complete.
      rl.close();
      return;
    }
    let gitCheckOut = execSync(`git checkout ${branch}`, {cwd: appDir}).toString();
    console.log(`git checkout to ${branch}: ${gitCheckOut}`);
    console.log(chalk.green.bold(`${project} git fetch & rebase`));
    let gitPull = execSync(`git fetch origin && git rebase origin/${branch}`, {cwd: appDir}).toString();
    console.log(`${project} ${gitPull}`);
    let gitDescribeCmd = tagPattern ? `git describe --match ${tagPattern}` : 'git describe';
    let gitDescribe = execSync(gitDescribeCmd, {cwd: appDir}).toString();
    if (/-g/.test(gitDescribe.toString())) {
      let currentCommitId = execSync(`git rev-parse head`, {cwd: appDir}).toString();
      let remoteCommitId = execSync(`git ls-remote origin ${branch}`, {cwd: appDir}).toString();
      if (!remoteCommitId.includes(currentCommitId.replace(/\r?\n|\r/gm, ''))) {
        console.log(`${project} latest commit in your local work space is different with the remote ${branch}. Please commit your change first.`);
        rl.close();
        return;
      }
      let currentTag = /\d+\.\d+\.\d+/.exec(gitDescribe)[0];
      let newTag = getNewTag(currentTag);
      let currentTagDisplay = chalk.yellow.bold(currentTag);
      let newTagDisplay = chalk.yellow.bold(newTag);
      console.log(`${project} need bump version`);
      console.log(`${project} current tag is ${currentTagDisplay}. Please enter a new tag. Press ${chalk.green.bold('ENTER')} to use ${newTagDisplay} as new tag:`);
      rl.prompt();
      rl.on('line', answer => {
        let finalTag;
        if (!answer) {
          finalTag = newTag;
        } else if (/\d+\.\d+\.\d+/.test(answer) && compare(answer, currentTag) === 1) {
          finalTag = answer;
        } else {
          console.log(`Illegal Tag!!! Please follow the semantic versioning and the new tag must greater than ${currentTagDisplay}`);
          rl.prompt();
        }
        if (finalTag) {
          let gitTag = execSync(`git tag -a ${finalTag} -m 'bump version' && git review -s && git push gerrit ${finalTag}`, {cwd: appDir}).toString();
          console.log(gitTag);
          console.log(`${project} update new tag: ${finalTag}\n\n`);
          rl.close();
          updateTag(apps);
        }
      });
    } else {
      console.log(`${project} is up to date with latest tag ${/\d+\.\d+\.\d+/.exec(gitDescribe)[0]}, no need to update the tag.\n\n`);
      rl.close();
      updateTag(apps);
    }
  } catch (e) {
    console.log(e.message);
    rl.close();
  }
}

updateTag(applications);
