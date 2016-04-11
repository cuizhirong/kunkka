'use strict'

const fs = require('fs');
const path = require('path');
const apiPath = path.join(__dirname, '../server/api');
const driverPath = path.join(__dirname, '../server/drivers');
const baseConfig = require('../configs/server');
const basePackage = require('../package.json');

const configList = [];

[apiPath, driverPath].forEach( p => {
  fs.readdirSync(p)
    .forEach( f => {
      try {
        configList.push(require(path.join(p, f, 'config.js')));
      } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
          console.log(err);
        }
      }
    });
});

/* remove other useless characters which don`t cover seperator of version string. */
const removeOtherChar = function (str, cut) {
  if (str.constructor === Array) {
    str.forEach( (s, i) => {
      str[i] = removeOtherChar(s);
    });
  } else {
    let arr = str.split('');
    let i = 0;
    str = '';
    while(arr[i]) {
      if (!isNaN(Number(arr[i])) || arr[i] === cut) {
        str += arr[i];
      }
      i++;
    }
  }
  return str;
}

/* get the newset (or oldest) version. */
const compareVersion = function (a, b, cut, isNew) {
  cut = (cut === undefined) ? '.' : cut;
  isNew = (isNew === undefined) ? true : isNew;
  let arr_1 = a.substr('1').split(cut);
  let arr_2 = b.substr('1').split(cut);
  let flag; // true: a > b
  arr_1.some( (e, i) => {
    return (arr_1[i] != arr_2[i]) && (flag = (arr_1[i] > arr_2[i]) ? true : false);
  });
  return (isNew === flag) ? a : b;
}

/* travel every attribute of json. */
const travel = function (newConfig, oldConfig, isVersion) {
  isVersion = (isVersion === undefined) ? false : isVersion;
  for ( let k in newConfig ) {
    if (newConfig[k].constructor === Object) {
      if (oldConfig[k] === undefined) {
        oldConfig[k] = {};
      }
      travel(newConfig[k], oldConfig[k]);
    } else {
      if (isVersion) { // is version.
        oldConfig[k] = compareVersion(oldConfig[k], newConfig[k]);
      } else {
        oldConfig[k] = newConfig[k];
      }
    }
  }
};

configList.forEach( con => {
  travel(con.config, baseConfig);
  travel(con.dependencies, basePackage.dependencies, true);
});

/* generate mixed json file. */

const generateFile = function (arr) {
  fs.writeFile(arr[0]._path, JSON.stringify(arr[0]._str, null, 2), err => {
    if (err) {
      console.log(err);
    } else {
      console.log('Generate file successfully!');
    }
    arr.shift();
    if (arr[0] !== undefined) {
      generateFile(arr);
    } else {
      console.log('All done!');
    }
  });
}

const _arr = [
  {_path: path.join(__dirname, '../configs/server.new.js'), _str: baseConfig},
  {_path: path.join(__dirname, '../package.new.json'), _str: basePackage}
];

generateFile(_arr);
