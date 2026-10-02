const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Underwriter = sequelize.define('Underwriter', {
  underwriter_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  kode_underwriter: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nama_underwriter: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'underwriter',
  timestamps: false
});

module.exports = Underwriter;