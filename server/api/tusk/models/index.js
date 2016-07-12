'use strict';

const mysql = require('../../../drivers/meepo').mysql;

const tusk = mysql.import('tusk', (entity, DataTypes) => {
  return entity.define('tusk', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    app: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'compositeIndex'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'compositeIndex'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    tableName: 'tusk',
    createdAt: 'create_at',
    updatedAt: 'update_at',
    comment: 'This is the table to store configurations.'
  });
});

mysql.sync().then( () => {
  console.log('mysql for tusk sync done!');
}).catch(e => {
  console.log(e);
});

module.exports = tusk;
