'use strict';


module.exports = function (mysql, DataTypes) {
  const Reply = mysql.define('reply', {
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
    }
  }, {
    paranoid: true
  });
  return Reply;
};
