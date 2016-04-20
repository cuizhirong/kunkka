var fs = require('fs');
var Path = require('path');
var ChildProcess = require('child_process');
var Config = require('../configs/server.json');

function color(str, c) {
  // 0: black; 1: red; 2: green; 3: yellow; 4: blue; 5: purple; 6: cyan; 7: white;
  return '\033[' + c + 'm ' + str + ' \033[0m';
}

function cyan(str) {
  return color(str, '36');
}

function red(str) {
  return color(str, '41;37;1');
}

function yellow(str) {
  return color(str, '43;37;1');
}

var oldLog = console.log;
console.log = function(msg) {
  return oldLog.call(console, cyan('~') + msg);
}

function execShell(shell, error, func) {
  console.log('Try to "' + cyan(shell) + '"');
  ChildProcess.exec(shell, function(err, stdout, stderr) {
    if (err === null) {
      console.log('  "' + cyan(shell) + '" successfully!');
      if (func) {
        return func();
      }
    } else {
      error = red('Error: ') + (error ? error : '') + ' > ' + red(stderr);
      console.log('  ' + error);
      process.exit(1);
    }
  });
}

function checkAndCreate(pathlist) {
  var dirlist = {};
  var filelist = {};
  var dir = '';
  var file = '';
  if (pathlist instanceof Array) {
    pathlist.forEach(function(ele) {
      if (Path.dirname(ele)) {
        dirlist[Path.dirname(ele)] = '';
      }
      if (Path.basename(ele)) {
        filelist[ele] = '';
      }
    });
    Object.keys(dirlist).forEach(function(ele) {
      if (!fs.existsSync(ele)) {
        dir += ' ' + ele;
      }
    });
    Object.keys(filelist).forEach(function(ele) {
      if (!fs.existsSync(ele)) {
        file += ' ' + ele;
      }
    });
  } else {
    dir = Path.dirname(pathlist) ? Path.dirname(pathlist) : '';
    file = Path.basename(pathlist) ? pathlist : '';
  }
  var stc_d = 'sudo mkdir ' + dir + '; sudo chmod a+rw ' + dir;
  var stc_f = 'sudo touch ' + file + '; sudo chmod a+rw ' + file;
  if (dir) {
    execShell(stc_d, '', execShell.bind(this, '', stc_f));
  } else if (file) {
    execShell(stc_f, '');
  }
}

function checkService(service) {
  if (!service) {
    return console.log(red('Error') + ': Session engine (which is given in config.js) is empty!!!');
  }
  service = service.toLowerCase();
  console.log('You have chosen "' + cyan(service) + '" as a session storage!');
  if (service == 'session') {
    return console.log(yellow('WARNING') + ': You do not use any memory cache ( like "memcached" or "redis" )');
  }
  console.log(service + ' address is ' + cyan(Config.sessionEngine.address + ':' + Config.sessionEngine.port));
  var stc = 'nc -w 10 -z ' + Config.sessionEngine.address + ' ' + Config.sessionEngine.port;
  execShell(stc, 'Can not connect to ' + cyan(Config.sessionEngine.address + ':' + Config.sessionEngine.port));
}

//checkService(Config.sessionEngine.type);
checkAndCreate([Config.log.accessLogPath, Config.log.errorLogPath]);

console.log = oldLog;
