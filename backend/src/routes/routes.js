const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");

router.get("/price/:tag", controller.getCurrentPrice);
router.get("/search/:query", controller.searchForCompany);
router.get("/search/news/:query", controller.searchNews);
router.post("/buy/:tag", controller.buyStocks);

module.exports = router;