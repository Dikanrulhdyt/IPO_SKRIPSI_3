const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

async function createAdmin() {
  try {
    await sequelize.sync();
    
    const existing = await User.findOne({ where: { username: 'admin' } });
    if (existing) {
      console.log('✅ User admin sudah ada');
      process.exit(0);
    }
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin123', salt);
    
    await User.create({
      username: 'admin',
      email: 'admin@ipo.com',
      password_hash: 'Admin123',
      role: 'admin'
    });
    console.log('✅ Admin created');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createAdmin();