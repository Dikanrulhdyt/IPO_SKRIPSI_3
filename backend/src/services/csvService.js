const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../../data/data_ipo_ready.csv');
const EMITEN_PATH = path.join(__dirname, '../../data/emiten_master.csv');
const UW_MASTER_PATH = path.join(__dirname, '../../data/underwriter_master.csv');

let cachedData = null;
let cachedEmitenMap = null;
let cachedUwMasterMap = null;

function loadEmitenMap() {
  if (cachedEmitenMap) return Promise.resolve(cachedEmitenMap);
  return new Promise((resolve, reject) => {
    const map = {};
    fs.createReadStream(EMITEN_PATH)
      .pipe(csv())
      .on('data', (row) => { map[row.kode_emiten] = row.nama_perusahaan; })
      .on('end', () => { cachedEmitenMap = map; resolve(map); })
      .on('error', reject);
  });
}

function loadUwMasterMap() {
  if (cachedUwMasterMap) return Promise.resolve(cachedUwMasterMap);
  return new Promise((resolve, reject) => {
    const map = {};
    fs.createReadStream(UW_MASTER_PATH)
      .pipe(csv())
      .on('data', (row) => { map[row.id] = row.nama; })
      .on('end', () => { cachedUwMasterMap = map; resolve(map); })
      .on('error', reject);
  });
}

function loadData() {
  return new Promise((resolve, reject) => {
    if (cachedData) return resolve(cachedData);
    const results = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => { cachedData = results; resolve(results); })
      .on('error', reject);
  });
}

async function getIpoData({ search, sector, sortBy, sortOrder = 'desc', page = 1, limit = 10 }) {
  let data = await loadData();
  const emitenMap = await loadEmitenMap();
  const uwMasterMap = await loadUwMasterMap();

  if (sector && sector !== 'all') {
    data = data.filter(row => row.sektor === sector);
  }

  if (search) {
    const lower = search.toLowerCase();
    data = data.filter(row => {
      const kode = (row.kode_emiten || '').toLowerCase();
      const nama = (emitenMap[row.kode_emiten] || '').toLowerCase();
      return kode.includes(lower) || nama.includes(lower);
    });
  }

  if (sortBy && data[0] && data[0][sortBy] !== undefined) {
    data.sort((a, b) => {
      let valA = parseFloat(a[sortBy]) || a[sortBy];
      let valB = parseFloat(b[sortBy]) || b[sortBy];
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }

  const transformed = data.map(row => {
    let underwriterNames = [];
    if (row.underwriter_ids) {
      try {
        const ids = JSON.parse(row.underwriter_ids);
        underwriterNames = ids.map(id => uwMasterMap[id] || id);
      } catch(e) {}
    }
    return {
      kode_emiten: row.kode_emiten,
      nama_perusahaan: emitenMap[row.kode_emiten] || row.kode_emiten,
      tahun: row.tanggal ? new Date(row.tanggal).getFullYear() : null,
      underwriter: underwriterNames.join(', '),
      harga_ipo: parseFloat(row.harga_ipo),
      jumlah_lot_saham: parseFloat(row.jumlah_lot_saham),
      free_float: parseFloat(row.free_float),
      size_ipo: parseFloat(row.size_ipo),
      sektor: row.sektor,
      initial_return: parseFloat(row.initial_return),
      label: row.label
    };
  });

  const total = transformed.length;
  const start = (page - 1) * limit;
  const paginated = transformed.slice(start, start + limit);
  return { total, page, limit, data: paginated };
}

async function getDashboardStats() {
  const data = await loadData();
  const totalIPO = data.length;

  const uwStatsPath = path.join(__dirname, '../../data/underwriter_stats.json');
  const uwStats = JSON.parse(fs.readFileSync(uwStatsPath, 'utf8'));
  const totalUnderwriter = Object.keys(uwStats).length;

  let avgReturn = 0;
  if (data.length) {
    const sum = data.reduce((a, r) => a + (parseFloat(r.initial_return) || 0), 0);
    avgReturn = sum / data.length;
  }

  const yearMap = {};
  data.forEach(row => {
    if (row.tanggal) {
      const year = new Date(row.tanggal).getFullYear();
      if (!isNaN(year)) yearMap[year] = (yearMap[year] || 0) + 1;
    }
  });
  const ipoPerYear = Object.entries(yearMap).map(([y, c]) => ({ year: parseInt(y), count: c }));
  ipoPerYear.sort((a,b) => a.year - b.year);

  const sectorMap = {};
  data.forEach(row => {
    const s = row.sektor;
    if (s) {
      if (!sectorMap[s]) sectorMap[s] = { sum: 0, count: 0 };
      sectorMap[s].sum += parseFloat(row.initial_return) || 0;
      sectorMap[s].count++;
    }
  });
  const sectorAvgReturn = Object.entries(sectorMap).map(([s, {sum, count}]) => ({ sector: s, avgReturn: sum / count }));

  return { totalIPO, totalUnderwriter, avgInitialReturn: avgReturn, ipoPerYear, sectorAvgReturn };
}

async function getUnderwriterDetail(uwId) {
  const data = await loadData();
  const emitenMap = await loadEmitenMap();
  const filtered = data.filter(row => {
    if (!row.underwriter_ids) return false;
    try {
      const ids = JSON.parse(row.underwriter_ids);
      return ids.includes(uwId);
    } catch(e) { return false; }
  }).map(row => ({
    kode_emiten: row.kode_emiten,
    nama_perusahaan: emitenMap[row.kode_emiten] || row.kode_emiten,
    tanggal: row.tanggal,
    initial_return: parseFloat(row.initial_return),
    label: row.label
  }));
  return filtered;
}

module.exports = { getIpoData, getDashboardStats, getUnderwriterDetail };