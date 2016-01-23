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
    for (var i = 0, len = files.length; i < len; i++) {
      file = files[i];
      assign(output, require(files[i])[language], files[i]);
    }
    writeFile(JSON.stringify(output));
  } catch (e) {
    console.log(chalk.white.bgRed.bold(' ERROR ') + ' i18n file ' + file + ' got something wrong!');
  }
});

function assign(source, obj, path) {
  var k = null;
  Object.keys(obj).forEach(function(m) {
    var b = Object.keys(source).some(function(n) {
      if (m === n) {
        k = n;
        return true;
      }
      return false;
    });
    if (b) {
      console.log(chalk.white.bgYellow.bold(' WARNING ') + ' the key ' + chalk.bold(k) + ' is duplicate in the file ' + path);
    } else {
      source[m] = obj[m];
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
