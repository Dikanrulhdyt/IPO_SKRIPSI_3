const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_skripsi_ipo';

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Silakan login terlebih dahulu' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.user_id);
    if (!user) {
      return res.status(401).json({ error: 'User tidak ditemukan' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token tidak valid, silakan login ulang' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat mengakses.' });
  }
};