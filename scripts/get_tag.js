'use strict';

const path = require('path');
const config = require(path.join(__dirname, '../../config'));
const applications = config.applications;
const http = require('http');
const EventEmitter = require('events');
const emitter = new EventEmitter();

// please create a token.json file first!
let token;
try {
  token = require('../token').token;
} catch (e) {
  console.log('No token.json file! Please create a token.json file and put your gitlab private token in it. /nThe format is {"token":"xxx"}');
  throw e;
}

function split (flag, version) {
  var result = [];
  if (flag) {
    var tail = version.split('-')[1];
    var _version = version.split('-')[0];
    result = _version.split('.');
    tail = tail.split('.');
    result = result.concat(tail);
  } else {
    result = version.split('.');
  }
  return result;
}

function convertToNumber (arr) {
  return arr.map(function (el) {
    return isNaN(el) ? el : parseInt(el, 10);
  });
}

function compare (v1, v2) {
  var flag1 = v1.indexOf('-') > -1 ? true : false;
  var flag2 = v2.indexOf('-') > -1 ? true : false;
  var arr1 = split(flag1, v1);
  var arr2 = split(flag2, v2);
  arr1 = convertToNumber(arr1);
  arr2 = convertToNumber(arr2);
  var len = Math.max(arr1.length, arr2.length);
  for (var i = 0; i < len; i ++) {
    if (arr1[i] === undefined) {
      return -1;
    } else if (arr2[i] === undefined) {
      return 1;
    }
    if (arr1[i] > arr2[i]) {
      return 1;
    } else if(arr1[i] < arr2[i]) {
      return -1;
    }
  }
  return 0;
}

const len = applications.length;
for (let i = 0; i < len; i++) {
  let opt = {
    host: 'git.ustack.com',
    path: `/api/v3/projects/ustack%2F${applications[i].project}/repository/tags`,
    headers: {
      'PRIVATE-TOKEN': token
    }
  };
  let request = http.request(opt, (res) => {
    res.setEncoding('utf8');
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      let tags = JSON.parse(data);
      tags.sort((a, b) => compare(b.name, a.name));
      applications[i].branch.production = tags[0].name;
      emitter.emit('finish');
    });
  });

  request.on('error', (e) => {
    console.log(e);
  });

  request.end();
}

// get halo tag
let haloOpt = {
  host: 'git.ustack.com',
  path: `/api/v3/projects/ustack%2Fhalo/repository/tags`,
  headers: {
    'PRIVATE-TOKEN': token
  }
};

let request = http.request(haloOpt, (res) => {
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    let tags = JSON.parse(data);
    tags.sort((a, b) => compare(b.name, a.name));
    let latestTag = tags[0].name;
    config.halo = latestTag;
    emitter.emit('finish');
  });
});

request.on('error', (e) => {
  console.log(e);
});

request.end();


const fs = require('fs');
let count = 0;
emitter.on('finish', () => {
  count += 1;
  if (count === len + 1) {
    fs.writeFile(path.join(__dirname, '../../config.json'), JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('finish!');
      }
    });
  }
});
