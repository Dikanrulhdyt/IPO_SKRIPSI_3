const express = require('express');
const { getIpoData } = require('../controllers/ipoDataController');
const router = express.Router();

router.get('/', getIpoData);

module.exports = router;