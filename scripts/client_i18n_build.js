'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

let language = process.env.npm_config_lang || process.env.language;
if (!language) {
  language = 'zh-CN';
}

const rootDir = path.resolve(__dirname, '..');
const appsDir = path.join(rootDir, 'client', 'applications');
let applications = fs.readdirSync(appsDir).filter(function(m) {
  return fs.statSync(path.join(appsDir, m)).isDirectory();
});
let appList = (process.env.npm_config_app && process.env.npm_config_app.split(',')) || applications;

function buildInvertedIndex(files, output) {
  let invertedIndex = {
    words: [],
    docIndex: {}
  };

  files.forEach(file => {
    let obj = require(file)[language];
    Object.keys(obj).forEach(key => {
      if (invertedIndex.words.indexOf(key) === -1) {
        invertedIndex.words.push(key);
        invertedIndex.docIndex[key] = [file];
        output[key] = obj[key];
      } else {
        invertedIndex.docIndex[key].push(file);
      }
    });
  });

  invertedIndex.words.forEach(function(word) {
    let dupCount = invertedIndex.docIndex[word].length;
    if (dupCount > 1) {
      console.log(chalk.white.bgYellow.bold(' WARNING ') + ' the key ' + chalk.bold(word) + ' is duplicate in ' + chalk.bold(dupCount) + ' files: ');
      invertedIndex.docIndex[word].forEach(function(_path) {
        console.log(_path);
      });
    }
  });
}


function writeFile(fileName, str) {
  let localePath = path.resolve(rootDir, 'locale');
  try {
    fs.accessSync(localePath, fs.F_OK);
  } catch (e) {
    fs.mkdirSync(localePath);
    fs.mkdirSync(path.join(localePath, 'client'));
  }
  let clientPath = path.join(localePath, 'client');
  try {
    fs.accessSync(clientPath, fs.F_OK);
  } catch (e) {
    fs.mkdirSync(clientPath);
  }
  try {
    fs.writeFileSync(path.join(clientPath, fileName), str, 'utf-8');
    console.log(chalk.white.bgGreen.bold(' SUCCESS ') + ' The ' + chalk.bold(language) + ' i18n file ' + chalk.bold(fileName) + ' has been generated!');
  } catch (e) {
    console.log(chalk.white.bgRed.bold('ERROR') + ' Fail to write i18n file ' + chalk.bold(fileName));
  }
}

appList.forEach(function(app) {
  let appDir = rootDir + '/client/applications/' + app;

  glob(appDir + '/modules/**/lang.json', {}, function(er, files) {
    files.unshift(appDir + '/locale/lang.json');
    let file = '';
    try {
      let output = {};
      buildInvertedIndex(files, output);
      writeFile(app + '.lang.json', JSON.stringify(output));
    } catch (e) {
      console.log(chalk.white.bgRed.bold(' ERROR ') + ' i18n file ' + file + ' got something wrong!');
    }
  });
});
