const express = require("express");
const router = express.Router();
const distributionService = require("../services/distributionService");

// Create a new distribution
router.post("/", async (req, res) => {
  try {
    const { itemId, inStockAmount } = req.body;
    const result = distributionService.createDistribution(
      itemId,
      inStockAmount
    );
    res.status(201).json({
      message: "Distribution created successfully",
      distributionId: result.distributionId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific distribution
router.get("/:id", (req, res) => {
  try {
    const distribution = distributionService.getDistributionById(req.params.id);
    if (distribution) {
      res.json(distribution);
    } else {
      res.status(404).json({ message: "Distribution not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all distributions
router.get("/", (req, res) => {
  try {
    const distributions = distributionService.getAllDistributions();
    res.json(distributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a distribution
router.patch("/:id", (req, res) => {
  try {
    const { inStockAmount } = req.body;
    const result = distributionService.updateDistribution(
      req.params.id,
      inStockAmount
    );
    if (result.changes) {
      res.json({ message: "Distribution updated successfully" });
    } else {
      res.status(404).json({ message: "Distribution not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a distribution
router.delete("/:id", (req, res) => {
  try {
    const result = distributionService.deleteDistribution(req.params.id);
    if (result.changes) {
      res.json({ message: "Distribution deleted successfully" });
    } else {
      res.status(404).json({ message: "Distribution not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
