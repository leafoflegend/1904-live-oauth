const Sequelize = require('sequelize');

const db = new Sequelize(process.env.DATABASE_URI || 'postgres://localhost:5432/1904-live-oauth', {
  logging: false,
});

module.exports = db;
