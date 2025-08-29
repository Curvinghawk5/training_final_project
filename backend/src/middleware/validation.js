const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: "Missing token" });
    const token = authHeader.split(" ")[1];

    if(!token) return res.status(401).json({error: "Missing token"});

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) return res.status(401).json({error: "Invalid token"});

        req.user = user;
        req.user.uuid = user.id[0].uuid;
        console.log(req.user);
        next();
    });
}

module.exports = {
    authenticateToken
}