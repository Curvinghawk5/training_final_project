const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");
const authenticationToken = require('../middleware/validation');

router.get("/price/:tag", controller.getCurrentPrice);
router.get("/search/:query", controller.searchForCompany);
router.get("/search/news/:query", controller.searchNews);
router.get("/convert", controller.convertCurrencyTest);
router.post("/buy/:tag", controller.buyStocks);
router.post("/auth/register", controller.createUser);
router.get("/auth/users", controller.getAllUsers);
router.post("/auth/login", controller.loginUser);
router.get("/user/portfolio", authenticationToken.authenticateToken, controller.getUsersPortfolio);

module.exports = router;