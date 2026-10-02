const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sektor = sequelize.define('Sektor', {
  sektor_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nama_sektor: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'sektor',
  timestamps: false
});

module.exports = Sektor;