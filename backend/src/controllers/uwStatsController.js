const { getUWStatsFromDB, getUnderwriterDetail } = require('../services/databaseService');

exports.getUWStats = async (req, res, next) => {
  try {
    let stats = await getUWStatsFromDB();

    const { sortBy = 'avg_return', sortOrder = 'DESC' } = req.query;
    stats.sort((a, b) => {
      let valA = a[sortBy] || 0;
      let valB = b[sortBy] || 0;
      if (sortOrder.toUpperCase() === 'ASC') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    const { search } = req.query;
    if (search) {
      const lower = search.toLowerCase();
      stats = stats.filter(item =>
        item.underwriter_id.toLowerCase().includes(lower) ||
        (item.nama_underwriter && item.nama_underwriter.toLowerCase().includes(lower))
      );
    }

    res.json(stats);
  } catch (err) { next(err); }
};

exports.getUWDetail = async (req, res, next) => {
  try {
    const { uwId } = req.params;
    const data = await getUnderwriterDetail(uwId);
    res.json(data);
  } catch (err) { next(err); }
};