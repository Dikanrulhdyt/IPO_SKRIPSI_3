const express = require('express');
const { getSektors } = require('../controllers/publicController');
const router = express.Router();

router.get('/sektors', getSektors);

module.exports = router;