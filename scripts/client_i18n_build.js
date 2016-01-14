var fs = require('fs');
var path = require('path');
var lang = require('../i18n/shared/lang.json');

var language = process.env.npm_config_lang || process.env.language;

var str = JSON.stringify(lang[language]);

var dir = path.resolve(__dirname, '../i18n/client');

try {
  fs.statSync(dir);
} catch (e) {
  fs.mkdirSync(dir);
}

fs.writeFileSync(path.join(dir, 'lang.json'), str, 'utf-8');
