const { getDashboardStats } = require('../services/databaseService');

exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};