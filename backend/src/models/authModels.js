const sql = require("../config/sql");

/////////////////////////////////////////////////////////////
//These handle all model functions related to authenticaion//
/////////////////////////////////////////////////////////////

/*
    Creates a new user in the Users table
    @param {object} user - The user object containing username, password, email, preferedCurrency
    @return {object} - The created user object
*/
async function createUser(user) {
    try {
        //Verify that the username is unique
        let userCheck = await (sql.Users).findAll({
            attributes: ['uuid'],
            where: {username: user.username}
        });
        if(userCheck.length == 0) {
            return await (sql.Users).create(user);
        }
        else{
            console.error("User of that username already exists");
        }
    } catch(err) {
        console.error("Error regisetering user");
    }
}

/*
    Gets all users in the Users table
    @return {object} - An array of all user objects
*/
async function getAllUsers() {
    return await (sql.Users).findAll();
}

/*
    Verifies a user's login credentials
    @param {object} user - The user object containing username and password
    @return {object} - An array containing the user object if found, empty array if not
*/
async function verifyLogin(user) {
    return await (sql.Users).findAll({
        attributes: ['uuid'],
        where: {username: user.username, password: user.password}
    });
}

module.exports = {
    createUser,
    getAllUsers,
    verifyLogin
};