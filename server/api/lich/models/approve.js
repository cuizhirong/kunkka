'use strict';

module.exports = function (mysql, DataTypes) {
  return mysql.define('approve', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    approver: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    result: {
      type: DataTypes.STRING,
      defaultValue: 'unopened',
      allowNull: false
    },
    explain: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    paranoid: true
  });
};
