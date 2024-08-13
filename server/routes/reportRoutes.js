const express = require("express");
const router = express.Router();
const reportController = require("../services/reportService");

router.get("/stock", reportController.getStockReport);

module.exports = router;
