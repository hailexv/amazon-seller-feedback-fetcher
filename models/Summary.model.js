const { Sequelize, DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Summary = sequelize.define('summary', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    thirty_days_summary: DataTypes.DOUBLE,
    ninety_days_summary: DataTypes.DOUBLE,
    twelve_months_summary: DataTypes.DOUBLE,
    lifetime_summary: DataTypes.DOUBLE,
});



module.exports = Summary;