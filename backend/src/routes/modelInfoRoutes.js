const express = require('express');
const { getModelInfo } = require('../controllers/modelInfoController');
const router = express.Router();

router.get('/', getModelInfo);

module.exports = router;