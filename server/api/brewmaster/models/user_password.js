'use strict';
module.exports = function (mysql, DataTypes) {
  const UserPass = mysql.define('user_password', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    paranoid: false,
    charset: 'utf8',
    classMethods: {
      associate: function (models) {
        UserPass.belongsTo(models.user, {foreignKey: 'userId'});
      }
    }
  });
  return UserPass;
};
