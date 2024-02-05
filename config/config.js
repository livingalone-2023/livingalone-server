// db랑 시퀄라이즈랑 연결하는 역할 
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
})

// 연결 테스트
sequelize
    .authenticate()
    .then(() => {
        console.log('Connected to the config');
    })
    .catch((err) => {
        console.error('Unable to connect to the config:', err);
    });

module.exports = sequelize;