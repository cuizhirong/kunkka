var fs = require('fs');
var path = require('path');
var glob = require('glob');
var chalk = require('chalk');

var language = process.env.npm_config_lang || process.env.language;
if (!language) {
  language = 'zh-CN';
}

var rootDir = path.resolve(__dirname, '..');

glob(rootDir + '/client/dashboard/modules/**/lang.json', {}, function(er, files) {
  files.unshift('../i18n/shared/lang.json');
  var file = '';
  try {
    var output = {};
    buildInvertedIndex(files, output);
    writeFile(JSON.stringify(output));
  } catch (e) {
    console.log(chalk.white.bgRed.bold(' ERROR ') + ' i18n file ' + file + ' got something wrong!');
  }
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

function writeFile(str) {
  var dir = path.resolve(rootDir, 'i18n/client');
  try {
    fs.statSync(dir);
  } catch (e) {
    fs.mkdirSync(dir);
  }
  fs.writeFileSync(path.join(dir, 'lang.json'), str, 'utf-8');
  console.log(chalk.white.bgGreen.bold(' SUCCESS ') + ' The ' + chalk.bold(language) + ' i18n file has been generated!');
}
