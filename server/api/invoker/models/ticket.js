'use strict';

module.exports = function (mysql, DataTypes) {
  const Ticket = mysql.define('ticket', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    processor: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: function (models) {
        Ticket.hasMany(models.reply);
        Ticket.hasMany(models.attachment);
        Ticket.hasMany(models.approver);
      }
    },
    paranoid: true,
    charset: 'utf8'
  });
  return Ticket;
};
