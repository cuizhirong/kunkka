'use strict';
module.exports = function (mysql, DataTypes) {
  return mysql.define('loginlog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING
    }
  }, {
    paranoid: false,
    charset: 'utf8'
  });
};
