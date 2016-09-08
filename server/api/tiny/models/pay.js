'use strict';

module.exports = function (mysql, DataTypes) {
  return mysql.define('pay', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      default: 'CNY'
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transferred: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    informed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    //alipay:trade_no
    //paypal:payment_id
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    charset: 'utf8',
    paranoid: true
  });
};
