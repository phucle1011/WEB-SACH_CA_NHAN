const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodejs_asm', 'root', 'mysql', {
    dialect: 'mysql',
    host: 'localhost'
});
module.exports = sequelize;
