const Sequelize = require('sequelize');
const database = require('./database');

const Category = database.define('categories', 
    {
        categoryId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        categoryName: Sequelize.STRING,
        status: Sequelize.TINYINT,
    },
    {
        timestamps: false,
    });

module.exports = Category;