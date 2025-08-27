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
        where: {username: user.username, password: user.password}
    });
}

module.exports = {
    createUser,
    getAllUsers,
    verifyLogin
}