const cron = require('node-cron');
const { IPO } = require('../models');
const { Op } = require('sequelize');

// Jalankan setiap hari jam 01:00
cron.schedule('0 1 * * *', async () => {
  try {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    const deleted = await IPO.destroy({
      where: {
        tanggal_ipo: { [Op.lt]: fiveYearsAgo }
      }
    });
    console.log(`🗑️ Deleted ${deleted} IPO records older than 5 years`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

console.log('✅ Cleanup job scheduled (runs daily at 1:00 AM)');