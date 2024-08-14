// returnsRoutes.js
const express = require("express");
const router = express.Router();
const returnsService = require("../services/returnsService");

router.post("/", (req, res) => {
  try {
    const returnId = returnsService.createReturn(req.body);
    res
      .status(201)
      .json({ id: returnId, message: "Return created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", (req, res) => {
  try {
    const returns = returnsService.getReturns();
    res.json(returns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/status/:status", (req, res) => {
  try {
    const returns = returnsService.getReturnsByStatus(req.params.status);
    res.json(returns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/count", (req, res) => {
  try {
    const counts = returnsService.getReturnCountByItem();
    res.json(counts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
