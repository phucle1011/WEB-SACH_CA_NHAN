const Sequelize = require('sequelize');
const database = require('./database');

const Product = database.define('products', 
    {
        productId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: Sequelize.STRING,
        author: Sequelize.STRING,
        publisher: Sequelize.STRING,
        price: Sequelize.NUMBER,
        images: Sequelize.STRING,
        description: Sequelize.TEXT,
        shortDescription: Sequelize.TEXT,
        publicationDate: Sequelize.DATE,
        categoryId : Sequelize.INTEGER,
    },
    {
        timestamps: false,
    });

module.exports = Product;