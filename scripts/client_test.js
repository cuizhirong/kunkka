const fs = require('fs');
const path = require('path');

function clearDir(dir) {
  try {
    fs.mkdirSync(dir);
  } catch (e) {
    console.log(e);
  }

  fs.readdirSync(dir).map(function(file) {
    fs.unlink(path.resolve(dir, file));
  });
}

function copyFile(source, dest) {
  if (fs.existsSync(source)) {
    let readFrom = fs.createReadStream(source);
    let writeTo = fs.createWriteStream(dest);
    readFrom.pipe(writeTo);
  }
}

let dest = 'tests/static_tests/';
clearDir(path.resolve(dest));

let loginPath = 'client/login/test/';
copyFile(path.resolve(loginPath, 'login-test.js'), path.resolve(dest, 'login-test.js'));

let componentsPath = 'client/components';
fs.readdirSync(path.resolve(componentsPath)).map(function(dirName) {
  let testDir = path.resolve(componentsPath, dirName, 'test');

  if (fs.existsSync(path.resolve(testDir))) {
    fs.readdirSync(path.resolve(testDir)).filter(function(fileName) {
      return (/-test.js$/).exec(fileName);
    }).forEach(function(file) {
      copyFile(path.resolve(testDir, file), path.resolve(dest, file));
    });
  }
});
