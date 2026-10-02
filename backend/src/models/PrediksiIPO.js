const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sektor = require('./Sektor');

const PrediksiIPO = sequelize.define('PrediksiIPO', {
  id_prediksi: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nama_emiten: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tanggal_prediksi: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  underwriter_ids: {
    type: DataTypes.TEXT,
    allowNull: true
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
  sektor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sektor',
      key: 'sektor_id'
    }
  },
  prob_sukses: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false
  },
  prediksi_label: {
    type: DataTypes.ENUM('SUKSES', 'TIDAK SUKSES'),
    allowNull: false
  },
  estimasi_initial_return: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: true
  },
  peringatan_bubble: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_dana_dihimpun: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  kategori: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'prediksi_ipo',
  timestamps: false
});

PrediksiIPO.belongsTo(Sektor, { foreignKey: 'sektor_id' });
Sektor.hasMany(PrediksiIPO, { foreignKey: 'sektor_id' });

module.exports = PrediksiIPO;