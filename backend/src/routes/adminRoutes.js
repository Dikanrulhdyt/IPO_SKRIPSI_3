const express = require('express');
const { 
  addIPO, 
  retrainModel, 
  getSektors, 
  getUnderwriters,
  getIPOByKode,
  deleteIPO,
  getAllIPOData
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken, isAdmin);

router.post('/ipo', addIPO);
router.post('/retrain', retrainModel);
router.get('/sektors', getSektors);
router.get('/underwriters', getUnderwriters);

// Route baru
router.get('/ipo/all', getAllIPOData);
router.get('/ipo/:kode', getIPOByKode);
router.delete('/ipo/:id', deleteIPO);

module.exports = router;