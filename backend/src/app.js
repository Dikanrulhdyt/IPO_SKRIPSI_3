const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const ipoDataRoutes = require('./routes/ipoDataRoutes');
const uwStatsRoutes = require('./routes/uwStatsRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const modelInfoRoutes = require('./routes/modelInfoRoutes');
const errorHandler = require('./utils/errorHandler');
const { sequelize } = require('./models');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes (tidak semua perlu auth)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);       // sudah ada middleware auth di dalamnya
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ipo-data', ipoDataRoutes);
app.use('/api/uw-stats', uwStatsRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/model-info', modelInfoRoutes);
app.use('/api/public', publicRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.use(errorHandler);

// Sinkronisasi database
sequelize.sync()
  .then(() => console.log('✅ Database synchronized'))
  .catch(err => console.error('❌ Sync error:', err));

module.exports = app;