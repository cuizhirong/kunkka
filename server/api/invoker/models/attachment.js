'use strict';

module.exports = function (mysql, DataTypes) {
  return mysql.define('attachment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    paranoid: true,
    charset: 'utf8'
  });
};
