const Sequelize = require('sequelize');

const db = new Sequelize(process.env.DATABASE_URI || 'postgres://localhost:5432/live-oauth-1904', {
  logging: false,
});

module.exports = db;
