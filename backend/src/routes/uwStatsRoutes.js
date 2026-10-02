const express = require('express');
const { getUWStats, getUWDetail } = require('../controllers/uwStatsController');
const router = express.Router();

router.get('/', getUWStats);
router.get('/:uwId', getUWDetail);

module.exports = router;   // <-- PASTIKAN INI