'use strict';

module.exports = function (mysql, DataTypes) {
  return mysql.define('pay', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      default: 'CAD'
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transferred: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    informed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    paranoid: true
  });
};
