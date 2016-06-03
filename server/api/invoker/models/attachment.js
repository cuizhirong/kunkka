'use strict';

module.exports = function (mysql, DataTypes) {
  const Attachment = mysql.define('attachment', {
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
    paranoid: true
  });
  return Attachment;
};
