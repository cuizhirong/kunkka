var fs = require('fs');
var path = require('path');

var i18n = {
  api: {},
  views: {}
};
var extensions = {};
var client = {};

function generateLangObject (dirPath, obj, moduleName, extraIgnore) {
  fs.readdirSync(dirPath)
    .filter(function(fileName) {
      return fileName !== 'index.js' && fileName !== extraIgnore;
    })
    .forEach(function (dir) {
      try {
        fs.accessSync(path.join(dirPath, dir, 'lang.json'), fs.F_OK);
        obj[dir] = require(path.join(dirPath, dir, 'lang.json'));
      } catch (e) {
        console.log(dir + ' ' + moduleName + ' has no lang.json');
      }
    });
}

var apiDirPath = path.join(__dirname, '../server/api');
generateLangObject(apiDirPath, i18n.api, 'api', 'extensions');

var viewsDirPath = path.join(__dirname, '../server/views');
generateLangObject(viewsDirPath, i18n.views, 'views');

var extensionsDirPath = path.join(__dirname, '../server/api/extensions');
generateLangObject(extensionsDirPath, extensions, 'extension');

Object.keys(extensions).forEach(function (ex) {
  Object.keys(extensions[ex]).forEach(function (lang) {
    Object.assign(i18n.api[ex][lang], extensions[ex][lang]);
  });
});

var clientModules = {};
var clientDirPath = path.join(__dirname, '../client/dashboard/modules');
generateLangObject(clientDirPath, clientModules, 'client module');


var shared = require(path.join(__dirname, '../i18n/shared/lang.json'));

var locales = {};
var _module = Object.keys(i18n);
var _component = Object.keys(i18n[_module[0]]);
var _locales = Object.keys(i18n.api[_component[0]]);
_locales.forEach(function (locale) {
  var localeLowerCase = locale.toLowerCase();
  locales[localeLowerCase] = {};
  client[localeLowerCase] = {};
  _module.forEach(function(m) {
    locales[localeLowerCase][m] = {};
  });
});



_locales.forEach(function (lang) {
  var langLowerCase = lang.toLowerCase();
  Object.keys(i18n).forEach(function (module) {
    Object.keys(i18n[module]).forEach(function (component) {
      locales[langLowerCase][module][component] = i18n[module][component][lang];
    })
  });
  Object.keys(clientModules).forEach(function (m) {
    Object.assign(client[langLowerCase], clientModules[m][lang]);
  });
  Object.assign(shared[lang], client[langLowerCase]);
  locales[langLowerCase]['shared'] = shared[lang];
});

function generateLocales() {
  _locales.forEach(function(locale) {
    var localeLowerCase = locale.toLowerCase();
    (function(loc) {
      fs.writeFile(path.join(__dirname, '../i18n/server', localeLowerCase + '.js'), JSON.stringify(locales[localeLowerCase]), function(err) {
        if (err) {
          console.log('fail to build %s locale file', loc);
        } else {
          console.log('successfully build %s locale file', loc);
        }
      })
    })(locale);
  });
}

fs.access(path.join(__dirname, '../i18n/server'), fs.F_OK, function(err) {
  if (err) {
    fs.mkdirSync(path.join(__dirname, '../i18n/server'));
    generateLocales();
  } else {
    generateLocales();
  }
});
