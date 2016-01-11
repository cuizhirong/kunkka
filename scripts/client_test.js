var fs = require('fs');
var path = require('path');

function clearDir(dir) {
  fs.readdirSync(dir).map(function(file) {
    fs.unlink(path.resolve(dir, file));
  });
}

function copyFile(source, dest) {
  if (fs.existsSync(source)) {
    var readFrom = fs.createReadStream(source);
    var writeTo = fs.createWriteStream(dest);
    readFrom.pipe(writeTo);
  }
}

var copyTo = 'tests/static_tests/';
clearDir(path.resolve(copyTo));

var loginPath = 'client/login/test/';
copyFile(path.resolve(loginPath, 'login-test.js'), path.resolve(copyTo, 'login-test.js'));

var componentsPath = 'client/components';
fs.readdirSync(path.resolve(componentsPath)).map(function(dirName) {
  var testDir = path.resolve(componentsPath, dirName, 'test');

  if (fs.existsSync(path.resolve(testDir))) {
    fs.readdirSync(path.resolve(testDir)).filter(function(fileName) {
      return (/-test.js$/).exec(fileName);
    }).forEach(function(file) {
      copyFile(path.resolve(testDir, file), path.resolve(copyTo, file));
    });
  }
});
