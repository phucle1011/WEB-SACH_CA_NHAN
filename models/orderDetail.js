const Sequelize = require('sequelize');
const database = require('./database');

const OrderDetail = database.define('order_details', 
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        order_id: Sequelize.INTEGER,
        product_id: Sequelize.INTEGER,
        quantity: Sequelize.INTEGER,
        price: Sequelize.DECIMAL,
    },
    {
        timestamps: false,
    });

module.exports = OrderDetail;
