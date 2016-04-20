var fs = require('fs');
var path = require('path');
var glob = require('glob');
var chalk = require('chalk');
var configs = require('../configs/config.json');

var language = process.env.npm_config_lang || process.env.language;
if (!language) {
  language = 'zh-CN';
}

var appList = (process.env.npm_config_app && process.env.npm_config_app.split(',')) || configs.applications;
var rootDir = path.resolve(__dirname, '..');

appList.forEach(function(app) {
  var appDir = rootDir + '/client/applications/' + app;

  glob(appDir + '/modules/**/lang.json', {}, function(er, files) {
    files.unshift(appDir + '/locale/lang.json');
    var file = '';
    try {
      var output = {};
      buildInvertedIndex(files, output);
      writeFile(app + '.lang.json', JSON.stringify(output));
    } catch (e) {
      console.log(chalk.white.bgRed.bold(' ERROR ') + ' i18n file ' + file + ' got something wrong!');
    }
  });
});

function buildInvertedIndex(files, output) {
  var invertedIndex = {
    words: [],
    docIndex: {}
  };

  for (var i = 0; i < files.length; i++) {
    var obj = require(files[i])[language];
    Object.keys(obj).forEach(function(key) {
      if (invertedIndex.words.indexOf(key) === -1) {
        invertedIndex.words.push(key);
        invertedIndex.docIndex[key] = [files[i]];
        output[key] = obj[key];
      } else {
        invertedIndex.docIndex[key].push(files[i]);
      }
    });
  }

  invertedIndex.words.forEach(function(word) {
    var dupCount = invertedIndex.docIndex[word].length;
    if (dupCount > 1) {
      console.log(chalk.white.bgYellow.bold(' WARNING ') + ' the key ' + chalk.bold(word) + ' is duplicate in ' + chalk.bold(dupCount) + ' files: ');
      invertedIndex.docIndex[word].forEach(function(path) {
        console.log(path);
      });
    }
  });
}

function writeFile(fileName, str) {
  var localePath = path.resolve(rootDir, 'locale');
  try {
    fs.accessSync(localePath, fs.F_OK)
  } catch (e) {
    fs.mkdirSync(localePath);
    fs.mkdirSync(path.join(localePath, 'client'));
  }
  var clientPath = path.join(localePath, 'client');
  try {
    fs.accessSync(clientPath, fs.F_OK)
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
