const sequelize = require('../config/database');
const Sektor = require('./Sektor');
const Underwriter = require('./Underwriter');
const IPO = require('./IPO');
const PrediksiIPO = require('./PrediksiIPO');
const User = require('./User');

module.exports = {
  sequelize,
  Sektor,
  Underwriter,
  IPO,
  PrediksiIPO,
  User
};