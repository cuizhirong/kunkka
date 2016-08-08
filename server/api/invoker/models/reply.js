'use strict';


module.exports = function (mysql, DataTypes) {
  return mysql.define('reply', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //content,status,
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'content'
    }
  }, {
    paranoid: true,
    charset: 'utf8'
  });
};
