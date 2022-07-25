const { Sequelize, DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Rater = sequelize.define('rater', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    rater: DataTypes.STRING,
    rating: DataTypes.DOUBLE,
    date: DataTypes.DATE,
    expandedText: DataTypes.TEXT('long'),
    raterProfile: DataTypes.STRING,
    seller: {
        type: DataTypes.INTEGER,
        references: {
            model: 'sellers',
            key: 'id'
        }
    }
}, {timestamps: false});


module.exports = Rater;