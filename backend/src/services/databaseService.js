const { Op } = require('sequelize');
const { IPO, Sektor, Underwriter } = require('../models');
const sequelize = require('../config/database');

async function getIpoData({ search, sector, sortBy = 'tanggal_ipo', sortOrder = 'DESC', page = 1, limit = 10 }) {
  const where = {};
  
  const validSortFields = ['tanggal_ipo', 'initial_return', 'harga_ipo', 'total_dana_dihimpun', 'market_cap'];
  const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'tanggal_ipo';
  const order = [[finalSortBy, sortOrder.toUpperCase()]];

  if (sector && sector !== 'all') {
    where.sektor_id = sector;
  }

  if (search) {
    where[Op.or] = [
      { kode_emiten: { [Op.like]: `%${search}%` } },
      { nama_emiten: { [Op.like]: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await IPO.findAndCountAll({
    where,
    include: [{ model: Sektor, attributes: ['nama_sektor'] }],
    order,
    limit,
    offset
  });

  const allData = await IPO.findAll({
    attributes: ['market_cap'],
    where: { market_cap: { [Op.not]: null } }
  });
  const sortedCap = allData.map(r => parseFloat(r.market_cap)).sort((a,b) => a-b);
  const p33 = sortedCap[Math.floor(sortedCap.length * 0.33)] || 0;
  const p66 = sortedCap[Math.floor(sortedCap.length * 0.66)] || 0;

  const formatted = rows.map(row => {
    const marketCap = parseFloat(row.market_cap) || 0;
    const totalDana = parseFloat(row.total_dana_dihimpun) || 0;
    
    let sizeCategory = 'Kecil';
    if (marketCap > p66) sizeCategory = 'Besar';
    else if (marketCap > p33) sizeCategory = 'Sedang';
    
    let underwriterIds = [];
    try {
      underwriterIds = row.underwriter_ids ? JSON.parse(row.underwriter_ids) : [];
    } catch(e) {}

    return {
      id_ipo: row.id_ipo,
      kode_emiten: row.kode_emiten,
      nama_emiten: row.nama_emiten || row.kode_emiten,
      tanggal_ipo: row.tanggal_ipo,
      harga_ipo: parseFloat(row.harga_ipo),
      jumlah_lot: row.jumlah_lot,
      free_float: parseFloat(row.free_float),
      initial_return: parseFloat(row.initial_return),
      status_sukses: row.status_sukses,
      sektor: row.Sektor ? row.Sektor.nama_sektor : 'Unknown',
      total_dana_dihimpun: totalDana,
      total_dana_miliar: totalDana / 1e9,
      market_cap: marketCap,
      market_cap_miliar: marketCap / 1e9,
      size_category: sizeCategory,
      num_underwriters: row.num_underwriters,
      underwriter_ids: underwriterIds
    };
  });

  return { total: count, page: parseInt(page), limit: parseInt(limit), data: formatted };
}

async function getDashboardStats() {
  const totalIPO = await IPO.count();

  // Gunakan getUWStatsFromDB untuk mendapatkan underwriter aktif
  const uwStats = await getUWStatsFromDB();
  const totalUnderwriter = uwStats.filter(uw => uw.jumlah_ipo > 0).length;

  const avgResult = await IPO.findOne({
    attributes: [[sequelize.fn('AVG', sequelize.col('initial_return')), 'avgReturn']],
    raw: true
  });
  const avgInitialReturn = avgResult ? parseFloat(avgResult.avgReturn) : 0;

  const ipoPerYear = await IPO.findAll({
    attributes: [
      [sequelize.fn('YEAR', sequelize.col('tanggal_ipo')), 'year'],
      [sequelize.fn('COUNT', sequelize.col('id_ipo')), 'count']
    ],
    group: [sequelize.fn('YEAR', sequelize.col('tanggal_ipo'))],
    order: [[sequelize.fn('YEAR', sequelize.col('tanggal_ipo')), 'ASC']],
    raw: true
  });

  const sectorAvg = await IPO.findAll({
    attributes: [
      [sequelize.col('Sektor.nama_sektor'), 'sector'],
      [sequelize.fn('AVG', sequelize.col('initial_return')), 'avgReturn']
    ],
    include: [{ model: Sektor, attributes: [] }],
    group: ['Sektor.nama_sektor'],
    raw: true
  });

  return {
    totalIPO,
    totalUnderwriter, // ← sekarang hanya underwriter aktif
    avgInitialReturn,
    ipoPerYear: ipoPerYear.map(r => ({ year: parseInt(r.year), count: parseInt(r.count) })),
    sectorAvgReturn: sectorAvg.map(r => ({ sector: r.sector, avgReturn: parseFloat(r.avgReturn) }))
  };
}

// ===== FUNGSI BARU: AMBIL STATISTIK UNDERWRITER DARI DATABASE =====
async function getUWStatsFromDB() {
  const allIPO = await IPO.findAll({
    attributes: ['underwriter_ids', 'initial_return']
  });

  const uwMap = {};
  let parseErrors = 0;
  let nullReturnCount = 0;

  allIPO.forEach(ipo => {
    if (ipo.underwriter_ids) {
      try {
        const ids = JSON.parse(ipo.underwriter_ids);
        if (Array.isArray(ids)) {
          ids.forEach(id => {
            if (!uwMap[id]) {
              uwMap[id] = { 
                jumlah_ipo: 0, 
                total_return: 0, 
                returns_count: 0,
                success_count: 0 
              };
            }
            // Selalu tambah jumlah IPO (termasuk yang initial_return null)
            uwMap[id].jumlah_ipo += 1;
            
            // Proses initial_return
            let ret = ipo.initial_return;
            if (ret !== null && ret !== undefined && !isNaN(parseFloat(ret))) {
              const numRet = parseFloat(ret);
              uwMap[id].total_return += numRet;
              uwMap[id].returns_count += 1;
              if (numRet > 0) {
                uwMap[id].success_count += 1;
              }
            } else {
              nullReturnCount++;
            }
          });
        }
      } catch (e) {
        parseErrors++;
      }
    }
  });

  if (parseErrors > 0) {
    console.warn(`⚠️ Gagal parse ${parseErrors} underwriter_ids`);
  }
  if (nullReturnCount > 0) {
    console.log(`ℹ️ ${nullReturnCount} IPO memiliki initial_return null (diabaikan untuk avg_return)`);
  }

  const stats = Object.entries(uwMap).map(([id, data]) => {
    const avgReturn = data.returns_count > 0
      ? data.total_return / data.returns_count
      : 0;
    const successRate = data.returns_count > 0
      ? data.success_count / data.returns_count
      : 0;
    return {
      underwriter_id: id,
      jumlah_ipo: data.jumlah_ipo,
      avg_return: avgReturn,
      success_rate: successRate
    };
  });

  // Ambil nama underwriter
  const underwriters = await Underwriter.findAll({
    attributes: ['kode_underwriter', 'nama_underwriter']
  });
  const nameMap = {};
  underwriters.forEach(uw => {
    nameMap[uw.kode_underwriter] = uw.nama_underwriter;
  });

  const result = stats.map(stat => ({
    ...stat,
    nama_underwriter: nameMap[stat.underwriter_id] || stat.underwriter_id
  }));

  console.log(`✅ Statistik UW: ${result.length} underwriter, ${parseErrors} error parse`);
  return result;
}

// ===== MODIFIKASI: getUnderwriterDetail MENGAKAN NAMA =====
async function getUnderwriterDetail(uwId) {
  // 1. Cari nama underwriter
  const underwriter = await Underwriter.findOne({
    where: { kode_underwriter: uwId },
    attributes: ['kode_underwriter', 'nama_underwriter']
  });
  const underwriterName = underwriter ? underwriter.nama_underwriter : uwId;

  // 2. Cari IPO yang melibatkan underwriter ini
  const ipos = await IPO.findAll({
    where: {
      [Op.or]: [
        { underwriter_ids: { [Op.like]: `%"${uwId}"%` } },
        { underwriter_ids: { [Op.like]: `%${uwId}%` } }
      ]
    },
    include: [{ model: Sektor, attributes: ['nama_sektor'] }],
    attributes: [
      'kode_emiten', 'nama_emiten', 'tanggal_ipo', 'initial_return',
      'status_sukses', 'harga_ipo', 'jumlah_lot', 'free_float',
      'total_dana_dihimpun', 'market_cap'
    ]
  });

  // 3. Hitung P33/P66
  const allData = await IPO.findAll({
    attributes: ['market_cap'],
    where: { market_cap: { [Op.not]: null } }
  });
  const sortedCap = allData.map(r => parseFloat(r.market_cap)).sort((a,b) => a-b);
  const p33 = sortedCap[Math.floor(sortedCap.length * 0.33)] || 0;
  const p66 = sortedCap[Math.floor(sortedCap.length * 0.66)] || 0;

  // 4. Format IPO list
  const ipoList = ipos.map(row => {
    const marketCap = parseFloat(row.market_cap) || 0;
    const totalDana = parseFloat(row.total_dana_dihimpun) || 0;
    let sizeCategory = 'Kecil';
    if (marketCap > p66) sizeCategory = 'Besar';
    else if (marketCap > p33) sizeCategory = 'Sedang';

    return {
      kode_emiten: row.kode_emiten,
      nama_emiten: row.nama_emiten || row.kode_emiten,
      tanggal_ipo: row.tanggal_ipo,
      harga_ipo: parseFloat(row.harga_ipo),
      jumlah_lot: row.jumlah_lot,
      free_float: parseFloat(row.free_float),
      initial_return: parseFloat(row.initial_return),
      status_sukses: row.status_sukses === 1 ? 'Sukses' : 'Gagal',
      sektor: row.Sektor ? row.Sektor.nama_sektor : 'Unknown',
      total_dana_dihimpun: totalDana,
      total_dana_miliar: totalDana / 1e9,
      market_cap: marketCap,
      market_cap_miliar: marketCap / 1e9,
      size_category: sizeCategory
    };
  });

  // 5. Kembalikan objek dengan underwriter_id, nama, dan ipo_list
  return {
    underwriter_id: uwId,
    underwriter_name: underwriterName,
    ipo_list: ipoList
  };
}

async function getPrediksiHistory(limit = 10) {
  const { PrediksiIPO } = require('../models');
  return await PrediksiIPO.findAll({
    include: [{ model: Sektor, attributes: ['nama_sektor'] }],
    order: [['tanggal_prediksi', 'DESC']],
    limit: parseInt(limit)
  });
}

module.exports = {
  getIpoData,
  getDashboardStats,
  getUWStatsFromDB,
  getUnderwriterDetail,
  getPrediksiHistory
};