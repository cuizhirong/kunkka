'use strict';
const config = require('config');
module.exports = function (mysql, DataTypes) {
  const User = mysql.define('user', {
    area_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: config('phone_area_code') || '86'
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },

    id: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    links: {
      type: DataTypes.STRING,
      allowNull: true
    },
    default_project_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    domain_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {

    paranoid: false,
    charset: 'utf8'
  });
  return User;
};
