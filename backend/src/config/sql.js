const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config({ quiet: true });
const bcrypt = require("bcrypt");

////////////////////////////////////////////////////////////
/////////////All SQL database stuff stored here/////////////
////////////////////////////////////////////////////////////

//Initialise Sequelize
const seq = new Sequelize('database', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false //Tell sequelize to **** (aka be quiet)
});

//Users table
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
    fname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    money: {
        type: DataTypes.FLOAT(15,2),
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
Users.addHook(
    "beforeCreate",
    user => (user.password = bcrypt.hashSync(user.password, 10))
);

//Portfolio Table
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
        type: DataTypes.FLOAT(15,2),
        allowNull: false,
        defaultValue: 0
    },
    inputValue: {
        type: DataTypes.FLOAT(15,2),
        allowedNull: false,
        defaultValue: 0
    },
    prefered_currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "usd"
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        allowedNull: false,
        defaultValue: false
    }
},
{
    tableName: 'portfolio',
    timestamps: false
});

//Shares table
const Shares = seq.define('shares', {
    id: {
        type: DataTypes.INTEGER,
        allowedNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    tag: {
        type: DataTypes.STRING,
        allowedNull: false
    },
    portfolio_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true
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
    current_ask: {
        type: DataTypes.FLOAT(15,2),
        allowNull: false
    },
    current_bid: {
        type: DataTypes.FLOAT(15,2),
        allowNull: false
    },
    amount_owned: {
        type: DataTypes.FLOAT,
        allowedNull: false
    },
    total_invested: {
        type: DataTypes.FLOAT(15,2),
        allowedNull: false
    },
    total_value: {
        type: DataTypes.FLOAT(15,2),
        allowedNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowedNull: false,
        defaultValue: "usd"
    }
},
{
    tableName: 'shares',
    timestamps: false
});

//Transaction log table
const TransactionLog = seq.define('transaction_log', {
    id: {
        type: DataTypes.INTEGER,
        allowedNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    timestamp: {
        type: DataTypes.DATE,
        allowedNull: false,
        defaultValue: DataTypes.NOW
    },
    buy_sell: {
        type: DataTypes.ENUM('buy', 'sell'),
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT(15,2),
        allowNull: false,
    },
    stock_traded: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    price_per: {
        type: DataTypes.FLOAT(15,2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stock_tag: {
        type: DataTypes.STRING,
        allowNull: false
    },
    portfolio_uuid: {
        type: DataTypes.UUID,
        allowedNull: false
    },
    owner_uuid: {
        type: DataTypes.UUID,
        allowedNull: false
    }
},
{
    tableName: 'transaction_log',
    timestamps: true
});

seq.sync({ alter: true });

module.exports = {
    seq,
    Users,
    Portfolio,
    Shares,
    TransactionLog
}