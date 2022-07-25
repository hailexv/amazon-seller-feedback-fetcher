const { Sequelize } = require('sequelize')
const { DB_HOST, DB_NAME, DB_USER_NAME, DB_PASSWORD } = require('./config');


const sequelize = new Sequelize(DB_NAME, DB_USER_NAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    logging: false
})

const connectDB = async () => {

    try {
        await sequelize.authenticate();
        console.log('Connected to database');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(0)
      }

      sequelize.sync().then(() => {
        console.log('Tables created successfully!');
     }).catch((error) => {
        console.error('Unable to create table : ', error);
     });
      

}

module.exports = {
    connectDB,
    sequelize
};
