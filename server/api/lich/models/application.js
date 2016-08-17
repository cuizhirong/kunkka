'use strict';

module.exports = function (mysql, DataTypes) {
  const Apply = mysql.define('application', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    projectId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //pending,approving,pass,refused
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'approving'
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    stackId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stackHref: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: function (models) {
        Apply.hasMany(models.approval);
      }
    },
    paranoid: true,
    charset: 'utf8'
  });
  return Apply;
};
