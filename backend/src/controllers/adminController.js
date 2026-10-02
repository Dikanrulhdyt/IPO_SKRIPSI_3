const { IPO, Sektor, Underwriter } = require('../models');
const { spawn } = require('child_process');
const path = require('path');

// --- Path ke Python di virtual environment ---
// Sesuaikan dengan lokasi venv Anda
const PYTHON_PATH = path.join(__dirname, '../../../venv/Scripts/python.exe');
// Jika Mac/Linux: path.join(__dirname, '../../../venv/bin/python')

function runPythonScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Running: ${PYTHON_PATH} ${scriptPath}`);
    const python = spawn(PYTHON_PATH, [scriptPath], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });
    let stdout = '', stderr = '';
    python.stdout.on('data', (data) => { stdout += data.toString(); console.log('[STDOUT]', data.toString()); });
    python.stderr.on('data', (data) => { stderr += data.toString(); console.error('[STDERR]', data.toString()); });
    python.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python exited with ${code}\n${stderr}`));
      }
      resolve({ stdout, stderr });
    });
  });
}

// --- Tambah IPO Baru ---
exports.addIPO = async (req, res, next) => {
  try {
    const { 
      kode_emiten, nama_emiten, tanggal_ipo, harga_ipo, 
      jumlah_lot, free_float, sektor_nama, underwriter_ids 
    } = req.body;

    if (!kode_emiten || !nama_emiten || !tanggal_ipo || !harga_ipo || !jumlah_lot || free_float === undefined || !sektor_nama || !underwriter_ids) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }
    if (!Array.isArray(underwriter_ids) || underwriter_ids.length === 0) {
      return res.status(400).json({ error: 'Minimal 1 underwriter' });
    }

    // Cari atau buat Sektor
    let sektor = await Sektor.findOne({ where: { nama_sektor: sektor_nama } });
    if (!sektor) {
      sektor = await Sektor.create({ nama_sektor: sektor_nama });
    }

    // Pastikan semua underwriter ada
    for (const uwCode of underwriter_ids) {
      const existing = await Underwriter.findOne({ where: { kode_underwriter: uwCode } });
      if (!existing) {
        await Underwriter.create({ 
          kode_underwriter: uwCode, 
          nama_underwriter: `UNKNOWN_${uwCode}` 
        });
      }
    }

    const newIPO = await IPO.create({
      kode_emiten,
      nama_emiten,
      tanggal_ipo,
      harga_ipo: parseFloat(harga_ipo),
      jumlah_lot: parseInt(jumlah_lot),
      free_float: parseFloat(free_float),
      sektor_id: sektor.sektor_id,
      underwriter_ids: JSON.stringify(underwriter_ids),
      num_underwriters: underwriter_ids.length,
      initial_return: null,
      status_sukses: null,
      total_dana_dihimpun: null,
      market_cap: null
    });

    res.status(201).json({ 
      message: 'IPO berhasil ditambahkan! Silakan jalankan Retraining.',
      data: newIPO 
    });

  } catch (error) {
    next(error);
  }
};

// --- Retraining Model ---
exports.retrainModel = async (req, res, next) => {
  try {
    const generatePath = path.join(__dirname, '../../../data-service/generate_dataset.py');
    const trainPath = path.join(__dirname, '../../../ml-service/model/train_model.py');

    console.log('🔄 Step 1: Running generate_dataset.py...');
    await runPythonScript(generatePath);
    console.log('✅ generate_dataset.py selesai');

    console.log('🔄 Step 2: Running train_model.py...');
    await runPythonScript(trainPath);
    console.log('✅ train_model.py selesai');

    res.json({ message: '✅ Retraining berhasil! Model terbaru siap digunakan.' });
  } catch (error) {
    console.error('Retraining gagal:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getSektors = async (req, res, next) => {
  try {
    const sektors = await Sektor.findAll({ attributes: ['sektor_id', 'nama_sektor'] });
    res.json(sektors);
  } catch (error) {
    next(error);
  }
};

exports.getUnderwriters = async (req, res, next) => {
  try {
    const uws = await Underwriter.findAll({ attributes: ['kode_underwriter', 'nama_underwriter'] });
    res.json(uws);
  } catch (error) {
    next(error);
  }
};

// --- Cari IPO berdasarkan kode emiten ---
exports.getIPOByKode = async (req, res, next) => {
  try {
    const { kode } = req.params;
    if (!kode) {
      return res.status(400).json({ error: 'Kode emiten wajib diisi' });
    }

    const ipo = await IPO.findOne({
      where: { kode_emiten: kode.toUpperCase() },
      include: [{ model: Sektor, attributes: ['nama_sektor'] }]
    });

    if (!ipo) {
      return res.status(404).json({ error: `IPO dengan kode ${kode} tidak ditemukan` });
    }

    let underwriterIds = [];
    try {
      underwriterIds = ipo.underwriter_ids ? JSON.parse(ipo.underwriter_ids) : [];
    } catch (e) {
      underwriterIds = [];
    }

    res.json({
      id_ipo: ipo.id_ipo,
      kode_emiten: ipo.kode_emiten,
      nama_emiten: ipo.nama_emiten,
      tanggal_ipo: ipo.tanggal_ipo,
      harga_ipo: ipo.harga_ipo,
      jumlah_lot: ipo.jumlah_lot,
      free_float: ipo.free_float,
      sektor_nama: ipo.Sektor ? ipo.Sektor.nama_sektor : null,
      underwriter_ids: underwriterIds,
      num_underwriters: ipo.num_underwriters,
      initial_return: ipo.initial_return,
      status_sukses: ipo.status_sukses,
      total_dana_dihimpun: ipo.total_dana_dihimpun,
      market_cap: ipo.market_cap
    });
  } catch (error) {
    console.error('Error getIPOByKode:', error);
    next(error);
  }
};

// --- Hapus IPO berdasarkan ID ---
exports.deleteIPO = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipo = await IPO.findByPk(id);
    if (!ipo) {
      return res.status(404).json({ error: 'IPO tidak ditemukan' });
    }
    const kodeEmiten = ipo.kode_emiten;
    await ipo.destroy();
    res.json({ message: `IPO ${kodeEmiten} berhasil dihapus`, deletedId: id });
  } catch (error) {
    console.error('Error deleteIPO:', error);
    next(error);
  }
};

// --- Ambil semua data IPO (untuk admin) ---
exports.getAllIPOData = async (req, res, next) => {
  try {
    const data = await IPO.findAll({
      include: [{ model: Sektor, attributes: ['nama_sektor'] }],
      order: [['tanggal_ipo', 'DESC']],
      attributes: ['id_ipo', 'kode_emiten', 'nama_emiten', 'tanggal_ipo', 'harga_ipo', 'jumlah_lot', 'free_float', 'initial_return', 'status_sukses']
    });
    res.json(data);
  } catch (error) {
    console.error('Error getAllIPOData:', error);
    next(error);
  }
};