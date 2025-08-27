const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

    const seq = new Sequelize('database', process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false //Tell sequelize to STFU
    });

const Users = seq.define('user', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    money: {
        type: DataTypes.FLOAT(2,2),
        allowNull: false,
        defaultValue: 0
    },
    prefered_currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "usd"
    }
},
{
    tableName: 'user',
    timestamps: false
});

const Portfolio = seq.define('portfolio', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    owner_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.FLOAT(2,2),
        allowNull: false,
        defaultValue: 0
    },
    prefered_currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "usd"
    }
},
{
    tableName: 'portfolio',
    timestamps: false
});

seq.sync();

module.exports = {
    seq,
    Users,
    Portfolio
}