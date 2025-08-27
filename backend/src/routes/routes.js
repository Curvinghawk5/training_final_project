const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");

router.get("/price", controller.getCurrentPrice);

module.exports = router;