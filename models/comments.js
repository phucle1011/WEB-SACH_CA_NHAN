const Sequelize = require('sequelize');
const database = require('./database');

const Comment = database.define('comments', 
    {
        commentId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        content: Sequelize.STRING,
        productId: Sequelize.STRING,
        userId: Sequelize.STRING
    },
    {
        timestamps: true, 
    });

module.exports = Comment;
