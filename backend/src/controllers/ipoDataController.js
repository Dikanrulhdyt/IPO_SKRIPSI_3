const { getIpoData } = require('../services/databaseService');

exports.getIpoData = async (req, res, next) => {
  try {
    const { search, sector, sortBy, sortOrder, page, limit } = req.query;
    const result = await getIpoData({
      search,
      sector,
      sortBy,
      sortOrder,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};