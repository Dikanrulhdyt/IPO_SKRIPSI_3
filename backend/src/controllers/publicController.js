const { Sektor } = require('../models');

exports.getSektors = async (req, res, next) => {
  try {
    const sektors = await Sektor.findAll({
      attributes: ['sektor_id', 'nama_sektor'],
      order: [['nama_sektor', 'ASC']]
    });
    res.json(sektors);
  } catch (error) {
    next(error);
  }
};