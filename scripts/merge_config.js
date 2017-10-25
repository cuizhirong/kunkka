'use strict';

const fs = require('fs');
const path = require('path');
const apiPath = path.join(__dirname, '../server/api');
const driverPath = path.join(__dirname, '../server/drivers');
const pluginPath = path.join(__dirname, '../server/plugins');
const clientAppsPath = path.join(__dirname, '../client/applications');
const baseConfig = require('../configs/server.sample.js');
const basePackage = require('../package.json');


/* get the newset (or oldest) version. */
const compareVersion = function(a, b, cut, isNew) {
  cut = (cut === undefined) ? '.' : cut;
  isNew = (isNew === undefined) ? true : isNew;
  let arr1 = a.substr('1').split(cut);
  let arr2 = b.substr('1').split(cut);
  let flag; // true: a > b
  arr1.some((e, i) => {
    return (arr1[i] !== arr2[i]) && (flag = (arr1[i] > arr2[i]) ? true : false);
  });
  return (isNew === flag) ? a : b;
};

/* travel every attribute of json. */
const travel = function(newConfig, oldConfig, isVersion) {
  isVersion = (isVersion === undefined) ? false : isVersion;
  for (let k in newConfig) {
    if (newConfig[k].constructor === Object) {
      if (oldConfig[k] === undefined) {
        oldConfig[k] = {};
      }
      travel(newConfig[k], oldConfig[k]);
    } else {
      if (isVersion) { // is version.
        if (oldConfig[k] === undefined) {
          oldConfig[k] = newConfig[k];
        } else {
          oldConfig[k] = compareVersion(oldConfig[k], newConfig[k]);
        }
      } else {
        oldConfig[k] = newConfig[k];
      }
    }
  }
};

let argv = process.argv.slice(2);
if (argv.length < 1) {
  let existConfig;

  try {
    existConfig = require('../configs/server.json');
  } catch (e) {
    existConfig = {};
  }
  travel(existConfig, baseConfig);
}

const configList = [];
const addressList = [];

[apiPath, driverPath, pluginPath].forEach(p => {
  fs.readdirSync(p)
    .filter(m => fs.statSync(path.join(p, m)).isDirectory())
    .forEach(f => {
      try {
        configList.push(require(path.join(p, f, 'config.sample.js')));
        addressList.push(path.join(p, f, 'config.sample.js'));
      } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
          console.log(err);
        }
      }
    });
});

fs.readdirSync(clientAppsPath)
  .filter(m => fs.statSync(path.join(clientAppsPath, m)).isDirectory())
  .forEach(m => {
    let modulePath = path.join(clientAppsPath, m);
    try {
      let moduleDepsPath = path.join(modulePath, 'dependence');
      configList.push({dependencies: require(moduleDepsPath)});
      addressList.push(moduleDepsPath);
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        console.log(err);
      }
    }
  });

/* remove other useless characters which don`t cover seperator of version string. */
const removeOtherChar = function(str, cut) {
  if (str.constructor === Array) {
    str.forEach((s, i) => {
      str[i] = removeOtherChar(s);
    });
  } else {
    let arr = str.split('');
    let i = 0;
    str = '';
    while (arr[i]) {
      if (!isNaN(Number(arr[i])) || arr[i] === cut) {
        str += arr[i];
      }
      i++;
    }
  }
  return str;
};

const smap = new Map();

const connect = function(pre, k) {
  return pre.concat('.', k);
};

const checkRepeatConfig = function(config, CRpath, pre) {
  for (let k in config) {
    if (config[k].constructor === Object) {
      if (pre === undefined) {
        checkRepeatConfig(config[k], CRpath, k);
      } else {
        checkRepeatConfig(config[k], CRpath, connect(pre, k));
      }
    }
    if (config[k].constructor !== Object) {
      if (pre === undefined) {
        if (!smap.has(k)) {
          let lpath = [];
          lpath.push(CRpath);
          smap.set(k, lpath);
        } else {
          smap.get(k).push(CRpath);
        }
      } else {
        if (!smap.has(connect(pre, k))) {
          let lpath = [];
          lpath.push(CRpath);
          smap.set(connect(pre, k), lpath);
        } else {
          smap.get(connect(pre, k)).push(CRpath);
        }
      }
    }
  }
};

for (let i = 0; i < configList.length; i++) {
  checkRepeatConfig(configList[i].config, addressList[i]);
}

const baseConfigPath = path.join(__dirname, '../configs/server.sample.js');
checkRepeatConfig(baseConfig, baseConfigPath);

if (argv.length > 0) {
  for (let item of smap.entries()) {
    if (item[1].length !== 1) {
      console.log('warning! ' + item[0] + ' is duplicate in those files:');
      for (let dir of item[1]) {
        console.log(dir);
      }
    }
  }
}


configList.forEach(con => {
  travel(con.config, baseConfig);
  travel(con.dependencies, basePackage.dependencies, true);
});

/* generate mixed json file. */

const generateFile = function(arr) {
  fs.writeFile(arr[0]._path, JSON.stringify(arr[0]._str, null, 2), err => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Generate ${arr[0]._path} file successfully!`);
    }
    arr.shift();
    if (arr[0] !== undefined) {
      generateFile(arr);
    } else {
      console.log('All done!');
    }
  });
};

const _arr = [{
  _path: path.join(__dirname, '../configs/server.json'),
  _str: baseConfig
}];

generateFile(_arr);
