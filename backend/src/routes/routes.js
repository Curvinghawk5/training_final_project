const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");
const authenticationToken = require('../middleware/validation');

router.get("/price/:tag", controller.getCurrentPrice);
router.get("/search/financial/:query", controller.searchFincancials);
router.get("/search/:query", controller.searchForCompany);
router.get("/search/news/:query", controller.searchNews);
router.get("/convert", controller.convertCurrencyTest);
router.post("/buy/:tag", authenticationToken.authenticateToken, controller.buyStocks);
router.post("/sell/:tag", authenticationToken.authenticateToken, controller.sellStocks);
router.post("/auth/register", controller.createUser);
router.get("/auth/users", controller.getAllUsers);
router.post("/auth/login", controller.loginUser);
router.get("/user/portfolio", authenticationToken.authenticateToken, controller.getUsersPortfolio);
router.post("/user/portfolio", authenticationToken.authenticateToken, controller.createPortfolio);
router.patch("/user/portfolio/update", authenticationToken.authenticateToken, controller.modifyPortfolio);
router.delete("/user/portfolio/:portfolio_uuid", authenticationToken.authenticateToken, controller.deletePortfolio)
router.get("/user/portfolio/value/:portfolio_uuid", authenticationToken.authenticateToken, controller.getPortfolioValue)

router.get("/user/portfolio/return/:portfolio_uuid", authenticationToken.authenticateToken, controller.getPortfolioReturn)
router.get("/user/portfolio/return/percentage/:portfolio_uuid", authenticationToken.authenticateToken, controller.getPortfolioReturnPercentage)

router.post("/user/deposit", authenticationToken.authenticateToken, controller.depositMoney)
router.post("/user/withdraw", authenticationToken.authenticateToken, controller.withdrawtMoney)
router.get("/user/balance", authenticationToken.authenticateToken, controller.getBalacne)
router.get("/user/shares/:portfolio_uuid", authenticationToken.authenticateToken, controller.getShares)
router.get("/user/logs", authenticationToken.authenticateToken, controller.getLogs)

module.exports = router;