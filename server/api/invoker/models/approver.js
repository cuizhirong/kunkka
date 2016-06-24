'use strict';

module.exports = function (mysql, DataTypes) {
  return mysql.define('approver', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    approver: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    paranoid: true
  });
};
