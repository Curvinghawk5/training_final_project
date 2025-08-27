const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

    const seq = new Sequelize('database', process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: "mysql"
    });

const Film = seq.define('database', {

},
{
    tableName: 'database',
    timestamps: false
});