const sequelize = require('../config/database');
const { IPO } = require('../models');
const { Op } = require('sequelize');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');

    const ipos = await IPO.findAll({
      where: { underwriter_ids: { [Op.ne]: null } }
    });

    let fixed = 0;
    for (const ipo of ipos) {
      let raw = ipo.underwriter_ids;
      let cleaned = null;

      try {
        // Fungsi rekursif untuk membersihkan
        function parseValue(val) {
          if (Array.isArray(val)) {
            return val.map(v => String(v).replace(/[\[\]"]/g, '').trim()).filter(Boolean);
          }
          if (typeof val === 'string') {
            try {
              return parseValue(JSON.parse(val));
            } catch {
              // split dengan koma
              return val.split(',').map(v => v.trim().replace(/[\[\]"]/g, '')).filter(Boolean);
            }
          }
          return [String(val).replace(/[\[\]"]/g, '').trim()].filter(Boolean);
        }

        const arr = parseValue(raw);
        if (arr.length > 0) {
          cleaned = JSON.stringify(arr);
          if (cleaned !== raw) {
            await ipo.update({ underwriter_ids: cleaned });
            fixed++;
            console.log(`✅ ${ipo.kode_emiten}: ${raw} -> ${cleaned}`);
          }
        }
      } catch (e) {
        console.error(`❌ Error ${ipo.kode_emiten}:`, e.message);
      }
    }

    console.log(`🎉 Fixed ${fixed} records`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fix();