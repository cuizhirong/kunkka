'use strict';

const fs = require('fs');
const path = require('path');

const config = require('../configs/server');
let extType = config.extension;

const i18n = {
  api: {},
  views: {}
};
const extensions = {};
const client = {};

function loadI18nFile (dirPath, _i18n) {
  fs.readdirSync(dirPath)
    .filter(_module => {
      return fs.statSync(path.join(dirPath, _module)).isDirectory();
    })
    .forEach(_m => {
      try {
        let langPath = path.join(dirPath, _m, 'lang.json');
        fs.accessSync(langPath, fs.R_OK);
        _i18n[_m] = require(langPath);
      } catch (e) {
        console.log(`${_m} has no lang.json file.`);
      }
    });
}

function generateServerLangObject (dirPath, apiI18N, extensionsI18N, viewsI18N) {
  fs.readdirSync(dirPath)
    .filter(dir => {
      return fs.statSync(path.join(dirPath, dir)).isDirectory();
    })
    .forEach(app => {
      // generate api i18n object
      let appApiPath = path.join(dirPath, app, 'api');
      loadI18nFile(appApiPath, apiI18N);
        // generate extension i18n object if exist
      if (extType) {
        let extensionsPath = path.join(dirPath, app, 'extensions', extType);
        loadI18nFile(extensionsPath, extensionsI18N);
      }
      // generate views i18n object
      let viewsPath = path.join(dirPath, app, 'views');
      loadI18nFile(viewsPath, viewsI18N);
    });
}

// generate server side i18n object
const apiDirPath = path.join(__dirname, '../server/api');
generateServerLangObject(apiDirPath, i18n.api, extensions, i18n.views);


Object.keys(extensions).forEach(ex => {
  Object.assign(i18n.api[ex], extensions[ex]);
});

// generate client side i18n object
const clientAppDirPath = path.join(__dirname, '../client/applications');
const i18nClientObj = {};
fs.readdirSync(clientAppDirPath)
  .forEach(app => {
    try {
      let appLangPath = path.join(clientAppDirPath, app, 'locale', 'lang.json');
      fs.accessSync(appLangPath, fs.R_OK);
      i18nClientObj[app] = require(appLangPath);
    } catch (e) {
      console.log(`${app} has no locale file.`);
    }
  });

// combine i18n objects
const locales = {};
const _module = Object.keys(i18n);
const _locales = ['en', 'zh-CN'];
_locales.forEach(locale => {
  let localeLowerCase = locale.toLowerCase();
  locales[localeLowerCase] = {};
  client[localeLowerCase] = {};
  _module.forEach(m => {
    locales[localeLowerCase][m] = {};
  });
});

_locales.forEach(lang => {
  var langLowerCase = lang.toLowerCase();
  Object.keys(i18n).forEach(module => {
    Object.keys(i18n[module]).forEach(component => {
      locales[langLowerCase][module][component] = i18n[module][component][lang];
    });
  });
  Object.keys(i18nClientObj).forEach(m => {
    client[langLowerCase][m] = i18nClientObj[m][lang];
  });
  locales[langLowerCase].shared = client[langLowerCase];
});

function generateLocales() {
  _locales.forEach(locale => {
    let localeLowerCase = locale.toLowerCase();
    (loc => {
      fs.writeFile(path.join(__dirname, '../locale/server', localeLowerCase + '.js'), JSON.stringify(locales[localeLowerCase]), (err) => {
        if (err) {
          console.log('fail to build %s locale file', loc);
        } else {
          console.log('successfully build %s locale file', loc);
        }
      });
    })(locale);
  });
}

fs.access(path.join(__dirname, '../locale'), fs.F_OK, (err) => {
  if (err) {
    fs.mkdirSync(path.join(__dirname, '../locale'));
    fs.mkdirSync(path.join(__dirname, '../locale/server'));
    generateLocales();
  } else {
    fs.access(path.join(__dirname, '../locale/server'), fs.F_OK, (e) =>{
      if (e) {
        fs.mkdirSync(path.join(__dirname, '../locale/server'));
        generateLocales();
      } else {
        generateLocales();
      }
    });
  }
});
