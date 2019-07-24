const { STRING } = require('sequelize');
const db = require('../db.js');

const User = db.define('user', {
  githubToken: {
    type: STRING,
    allowNull: false,
  },
});

module.exports = User;
