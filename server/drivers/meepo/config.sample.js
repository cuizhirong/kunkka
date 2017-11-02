'use strict';

module.exports = {
  dependencies: {
    'mysql': '^2.10.2',
    'sequelize': '^3.23.2'
  },
  config: {
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '1234',
      database: 'kunkka'
    }
  }
};
