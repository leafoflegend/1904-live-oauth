const { STRING, DATE } = require('sequelize');
const db = require('../db.js');

const Session = db.define('session', {
  sid: {
    type: STRING,
    primaryKey: true
  },
  userId: STRING,
  expires: DATE,
  data: STRING(50000)
});

module.exports = Session;
