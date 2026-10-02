const sequelize = require('../config/database');
const { Sektor, Underwriter, IPO } = require('../models');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_IPO_PATH = path.join(__dirname, '../../data/data_ipo_ready.csv');
const CSV_UW_PATH = path.join(__dirname, '../../data/underwriter_master.csv');

function parseUnderwriterIds(raw) {
  if (!raw) return '[]';
  if (typeof raw === 'string') {
    // Coba parse JSON
    try {
      let parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter dan bersihkan
        const cleaned = parsed.filter(Boolean).map(s => String(s).trim().toUpperCase());
        return JSON.stringify(cleaned);
      }
      if (typeof parsed === 'string') {
        // Escape berlapis, coba parse lagi
        try {
          const parsed2 = JSON.parse(parsed);
          if (Array.isArray(parsed2)) {
            const cleaned = parsed2.filter(Boolean).map(s => String(s).trim().toUpperCase());
            return JSON.stringify(cleaned);
          }
        } catch (e) {}
      }
    } catch (e) {
      // Bukan JSON, coba split by pipe atau koma
      if (raw.includes('|')) {
        const cleaned = raw.split('|').map(s => s.trim().toUpperCase()).filter(Boolean);
        return JSON.stringify(cleaned);
      }
      if (raw.includes(',')) {
        const cleaned = raw.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        return JSON.stringify(cleaned);
      }
      // Single value
      if (raw.trim()) {
        return JSON.stringify([raw.trim().toUpperCase()]);
      }
    }
  }
  return '[]';
}

async function importData() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');

    // 1. Import Sektor
    const ipoSektorSet = new Set();
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_IPO_PATH)
        .pipe(csv())
        .on('data', (row) => { if (row.sektor) ipoSektorSet.add(row.sektor); })
        .on('end', resolve)
        .on('error', reject);
    });

    const sektorList = Array.from(ipoSektorSet).map((nama, index) => ({
      sektor_id: index + 1,
      nama_sektor: nama
    }));
    await Sektor.bulkCreate(sektorList);
    console.log(`✅ Imported ${sektorList.length} sektors`);

    const sektorIdMap = {};
    sektorList.forEach(s => { sektorIdMap[s.nama_sektor] = s.sektor_id; });

    // 2. Import Underwriter
    const underwriters = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_UW_PATH)
        .pipe(csv())
        .on('data', (row) => {
          underwriters.push({
            kode_underwriter: row.id,
            nama_underwriter: row.nama
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    await Underwriter.bulkCreate(underwriters);
    console.log(`✅ Imported ${underwriters.length} underwriters`);

    // 3. Import IPO
    const ipoData = [];
    let parseErrors = 0;
    const debugTickers = ['RANS', 'PRDL', 'EMMI', 'BACH'];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_IPO_PATH)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // ===== DEBUG UNTUK DATA BARU =====
            if (debugTickers.includes(row.kode_emiten)) {
              console.log(`\n🔍 [IMPORT DEBUG] ${row.kode_emiten}:`);
              console.log(`   initial_return (raw) = "${row.initial_return}"`);
              console.log(`   label (raw) = "${row.label}"`);
              console.log(`   underwriter_ids (raw) = "${row.underwriter_ids}"`);
            }
            
            // Parse underwriter_ids dengan benar
            const uwIdsClean = parseUnderwriterIds(row.underwriter_ids);
            
            let labelVal = null;
            if (row.label !== undefined && row.label !== '' && row.label !== 'null') {
              const parsed = parseFloat(row.label);
              if (!isNaN(parsed)) labelVal = parsed;
            }
            
            let initialReturn = null;
            if (row.initial_return !== undefined && row.initial_return !== '' && row.initial_return !== 'null') {
              const parsed = parseFloat(row.initial_return);
              if (!isNaN(parsed)) initialReturn = parsed;
            }
            
            const namaEmiten = row.nama_emiten && row.nama_emiten.trim() !== '' 
              ? row.nama_emiten 
              : row.kode_emiten;
            
            const ipoEntry = {
              kode_emiten: row.kode_emiten,
              nama_emiten: namaEmiten,
              tanggal_ipo: row.tanggal,
              harga_ipo: parseFloat(row.harga_ipo) || 0,
              jumlah_lot: parseFloat(row.jumlah_lot_saham) || 0,
              free_float: parseFloat(row.free_float) || 0,
              initial_return: initialReturn,
              status_sukses: labelVal,
              total_dana_dihimpun: row.total_dana_dihimpun !== '' ? parseFloat(row.total_dana_dihimpun) : null,
              market_cap: row.market_cap !== '' ? parseFloat(row.market_cap) : null,
              num_underwriters: parseInt(row.num_underwriters) || 1,
              underwriter_ids: uwIdsClean,
              sektor_id: sektorIdMap[row.sektor] || 1
            };
            
            if (debugTickers.includes(row.kode_emiten)) {
              console.log(`   [IMPORT DEBUG] ${row.kode_emiten} setelah parse:`);
              console.log(`   initial_return = ${ipoEntry.initial_return}`);
              console.log(`   status_sukses = ${ipoEntry.status_sukses}`);
              console.log(`   underwriter_ids = ${ipoEntry.underwriter_ids}`);
            }
            
            ipoData.push(ipoEntry);
          } catch(err) {
            parseErrors++;
            console.error(`[IMPORT ERROR] Baris ${ipoData.length + 1}:`, err.message);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    await IPO.bulkCreate(ipoData);
    console.log(`✅ Imported ${ipoData.length} IPO records (dengan ${parseErrors} error parsing)`);
    console.log(`   Contoh nama emiten: ${ipoData[0]?.nama_emiten || '-'}`);
    
    for (const ticker of debugTickers) {
      const found = ipoData.find(d => d.kode_emiten === ticker);
      if (found) {
        console.log(`\n🔍 [IMPORT FINAL] ${ticker} di database:`);
        console.log(`   initial_return = ${found.initial_return}`);
        console.log(`   status_sukses = ${found.status_sukses}`);
        console.log(`   underwriter_ids = ${found.underwriter_ids}`);
      }
    }

    console.log('🎉 Data import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importData();