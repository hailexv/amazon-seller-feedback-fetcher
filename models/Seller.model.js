const { Sequelize, DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Seller = sequelize.define('seller', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    positive : {
        type: DataTypes.INTEGER,
        references: {
            model: 'summaries',
            key: 'id'
        }
    },
    neutral : {
        type: DataTypes.INTEGER,
        references: {
            model: 'summaries',
            key: 'id'
        }
    },
    negative : {
        type: DataTypes.INTEGER,
        references: {
            model: 'summaries',
            key: 'id'
        }
    },
    count: {
        type: DataTypes.INTEGER,
        references: {
            model: 'summaries',
            key: 'id'
        }
    }
});




module.exports = Seller;