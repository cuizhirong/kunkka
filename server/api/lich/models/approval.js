'use strict';

module.exports = function (mysql, DataTypes) {
  return mysql.define('approval', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    approverRole: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    //unopened,approving,pass,refused
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    explain: {
      type: DataTypes.TEXT
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    paranoid: true,
    charset: 'utf8'
  });
};
