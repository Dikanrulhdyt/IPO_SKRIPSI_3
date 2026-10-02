const fs = require('fs');
const path = require('path');
const METADATA_PATH = path.join(__dirname, '../../../ml-service/model/model_metadata.json');

exports.getModelInfo = (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Metadata tidak tersedia. Jalankan train_model.py terlebih dahulu.' });
  }
};