const { sequelize, PrediksiIPO } = require('../models');

(async () => {
  try {
    await PrediksiIPO.sync({ force: false });
    console.log('✅ Tabel prediksi_ipo berhasil dibuat (jika belum ada)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal membuat tabel:', err);
    process.exit(1);
  }
})();