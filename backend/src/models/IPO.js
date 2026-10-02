const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sektor = require('./Sektor');

const IPO = sequelize.define('IPO', {
  id_ipo: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  kode_emiten: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  nama_emiten: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tanggal_ipo: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  harga_ipo: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  jumlah_lot: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  free_float: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  initial_return: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: true
  },
  status_sukses: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  total_dana_dihimpun: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'harga_ipo * jumlah_lot * 100 * free_float/100 (dana yang dihimpun dari publik)'
  },
  market_cap: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'harga_ipo * jumlah_lot * 100 (total nilai perusahaan pada harga IPO)'
  },
  num_underwriters: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  underwriter_ids: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('underwriter_ids');
      return raw ? JSON.parse(raw) : [];
    },
    set(value) {
      this.setDataValue('underwriter_ids', JSON.stringify(value));
    }
  },
  sektor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sektor',
      key: 'sektor_id'
    }
  }
}, {
  tableName: 'ipo',
  timestamps: false
});

IPO.belongsTo(Sektor, { foreignKey: 'sektor_id' });
Sektor.hasMany(IPO, { foreignKey: 'sektor_id' });

module.exports = IPO;