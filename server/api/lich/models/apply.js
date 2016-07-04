'use strict';

module.exports = function (mysql, DataTypes) {
  const Apply = mysql.define('apply', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    number: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        Apply.hasMany(models.approve);
      }
    },
    paranoid: true
  });
  return Apply;
};
