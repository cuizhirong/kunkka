var fs = require('fs');
var path = require('path');
var baseLang = require('../i18n/shared/lang.json');
var glob = require('glob');

var language = process.env.npm_config_lang || process.env.language;
if (!language) {
  language = 'zh-CN';
}

if (!language) {
  language = 'zh-CN';
}
var rootDir = path.resolve(__dirname, '..');

var output = baseLang[language];

glob(rootDir + '/client/dashboard/modules/**/lang.json', {}, function(er, files) {
  for (var i = 0, len = files.length; i < len; i++) {
    Object.assign(output, require(files[i])[language]);
  }
  writeFile(JSON.stringify(output));
});

function writeFile(str) {
  var dir = path.resolve(rootDir, 'i18n/client');
  try {
    fs.statSync(dir);
  } catch (e) {
    fs.mkdirSync(dir);
  }
  fs.writeFileSync(path.join(dir, 'lang.json'), str, 'utf-8');
}
