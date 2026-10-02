const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-skripsi-ipo-2026';

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Generate token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }

    const user = await User.create({
      username,
      email,
      password_hash: password,
      role: role || 'investor'
    });

    res.status(201).json({
      message: 'User berhasil dibuat',
      user: { user_id: user.user_id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};