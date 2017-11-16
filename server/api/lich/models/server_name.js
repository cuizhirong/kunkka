'use strict';

module.exports = function(mysql, DataTypes) {
  return mysql.define('server_name', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  }, {
    paranoid: true,
    charset: 'utf8'
  });
};
