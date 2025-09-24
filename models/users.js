const Sequelize = require('sequelize');
const database = require('./database');

const User = database.define('users', {
    userId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false, 
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: true, 
        defaultValue: null,  
    },
    address: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,  
    },
    avatar: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,  
    },
}, {
    timestamps: false,
});

module.exports = User;
