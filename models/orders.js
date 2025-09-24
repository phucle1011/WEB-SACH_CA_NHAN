const Sequelize = require('sequelize');
const database = require('./database');
const OrderDetail = require('./orderDetail'); 

const Order = database.define('orders', 
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: Sequelize.INTEGER,
        total_price: Sequelize.DECIMAL,
        created_at: Sequelize.DATE,
        status: Sequelize.STRING,
        name: Sequelize.STRING,
        address: Sequelize.STRING,
        payment_method_id: Sequelize.INTEGER,
        email: Sequelize.STRING,
        phone: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: false,
    });

// Quan hệ giữa đơn hàng và chi tiết đơn hàng
Order.hasMany(OrderDetail, { foreignKey: 'order_id' });
OrderDetail.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = Order;
