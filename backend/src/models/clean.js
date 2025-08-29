const sql = require("../config/sql");

async function cleanDb() {
    await sql.Users.destroy({ where: {}, truncate: true });
    await sql.Portfolio.destroy({ where: {}, truncate: true });
    await sql.Shares.destroy({ where: {}, truncate: true });
    console.log("All tables cleaned!");
}

cleanDb();