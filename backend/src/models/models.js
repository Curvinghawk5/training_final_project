const express = require("express");
const app = express();
const sql = require("../config/sql");

async function createUser(user) {
    return await (sql.Users).create(user);
}
async function getAllUsers() {
    return await (sql.Users).findAll();
}
async function verifyLogin(user) {
    return await (sql.Users).findAll({
        attributes: ['uuid'],
        where: {username: user.username, password: user.password}
    });
}
async function getPortfolio(user) {
    return await (sql.Portfolio).findAll({
        where: {owner_uuid: user.uuid}
    });
}
module.exports = {
    createUser,
    getAllUsers,
    verifyLogin,
    getPortfolio
}