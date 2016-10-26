'use strict';

const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const config = require('../configs/server.json');
const mysqlConfig = config.mysql;
mysqlConfig.username = mysqlConfig.user;
delete mysqlConfig.user;

fs.writeFile(path.join(__dirname, '../server/db_migration/config.json'), JSON.stringify(mysqlConfig, null, 2), (err) => console.log(err ? err : 'copy config done!'));

const apiPath = path.join(__dirname, '../server/api');
const serverMigrationPath = path.join(__dirname, '../server/db_migration/migrations');

try {
  fs.accessSync(serverMigrationPath);
} catch (e) {
  fs.mkdirSync(serverMigrationPath);
}

fs
  .readdirSync(apiPath)
  .filter(dir => fs.statSync(path.join(apiPath, dir)).isDirectory() && dir.indexOf('.') === -1)
  .forEach(dir => {
    const migrationPath = path.join(apiPath, dir, 'migrations');
    fs.access(migrationPath, fs.R_OK, (err) => {
      if (err) {
        console.log(`${dir} has no migration scripts`);
      } else {
        exec(`cp -r ./* ${serverMigrationPath}/`, {
          cwd: migrationPath
        }, (e) => console.log(e ? e : `copy migrations scripts done from ${dir}`));
      }
    });
  });
