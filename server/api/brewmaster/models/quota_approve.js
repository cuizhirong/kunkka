'use strict';
module.exports = function (mysql, DataTypes) {
  const quotaApprove = mysql.define('quota_approve', {

    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    projectName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quota: {
      type: DataTypes.TEXT
    },
    addedQuota: {
      type: DataTypes.TEXT
    },
    originQuota: {
      type: DataTypes.TEXT
    },
    info: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        quotaApprove.belongsTo(models.user, {foreignKey: 'userId'});
      }
    },
    paranoid: false,
    charset: 'utf8'
  });
  return quotaApprove;
};
