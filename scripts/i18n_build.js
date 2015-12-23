var fs = require('fs');

var i18n = {
  drivers: {},
  api: {},
  views: {}
};

fs.readdirSync(__dirname + '/../drivers').forEach(function (dir) {
  i18n.drivers[dir] = require(__dirname + '/../drivers/' + dir + '/lang.json')
});

fs.readdirSync(__dirname + '/../server/api').filter(function (fileName) {
  return fileName !== 'index.js';
}).forEach(function (dir) {
  i18n.api[dir] = require(__dirname + '/../server/api/' + dir + '/lang.json');
});

fs.readdirSync(__dirname + '/../server/views').filter(function (fileName) {
  return fileName !== 'index.js';
}).forEach(function (dir) {
  i18n.views[dir] = require(__dirname + '/../server/views/' + dir + '/lang.json');
});


var shared = require(__dirname + '/../i18n/shared/lang.json');

var locales = {};
var _module = Object.keys(i18n);
var _component = Object.keys(i18n[_module[0]]);
var _locales = Object.keys(i18n.drivers[_component[0]]);
_locales.forEach(function (locale) {
  locales[locale.toLowerCase()] = {};
  _module.forEach(function (m) {
    locales[locale.toLowerCase()][m] = {};
  });
});

// Object.keys(i18n).forEach(function (module) {
//   Object.keys(i18n[module]).forEach(function (component) {
//     Object.keys(i18n[module][component]).forEach(function (lang) {
//       locales[lang][module][component] = i18n[module][component][lang];
//     });
//   });
// });

_locales.forEach(function (lang) {
  Object.keys(i18n).forEach(function (module) {
    Object.keys(i18n[module]).forEach(function (component) {
      locales[lang.toLowerCase()][module][component] = i18n[module][component][lang];
    })
  });
  locales[lang.toLowerCase()]['shared'] = shared[lang];
});

function generateLocales () {
  _locales.forEach(function (locale) {
    (function(loc) {
      fs.writeFile(__dirname + '/../i18n/server/' + locale.toLowerCase() + '.js', JSON.stringify(locales[locale.toLowerCase()]), function (err) {
        if (err) {
          console.log('fail to build %s locale file', loc);
        } else {
          console.log('successfully build %s locale file', loc);
        }
      })
    })(locale);
  });
}

fs.access(__dirname + '/../i18n/server', fs.F_OK, function (err) {
  if (err) {
    fs.mkdirSync( __dirname + '/../i18n/server');
    generateLocales();
  } else {
    generateLocales();
  }
})





