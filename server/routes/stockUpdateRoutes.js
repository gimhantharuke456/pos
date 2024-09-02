// routes/stockUpdateRoutes.js

const express = require("express");
const stockUpdateService = require("../services/stockUpdateService");

const router = express.Router();

// Create a new stock update
router.post("/", (req, res) => {
  try {
    const { itemId, updatedQuantity, type, updateDate } = req.body;
    const result = stockUpdateService.createStockUpdate(
      itemId,
      updatedQuantity,
      type,
      updateDate
    );
    res.status(201).json({
      message: "Stock update created successfully",
      stockUpdateId: result.stockUpdateId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific stock update by ID
router.get("/:id", (req, res) => {
  try {
    const stockUpdate = stockUpdateService.getStockUpdateById(req.params.id);
    if (stockUpdate) {
      res.json(stockUpdate);
    } else {
      res.status(404).json({ message: "Stock update not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all stock updates
router.get("/", (req, res) => {
  try {
    const stockUpdates = stockUpdateService.getAllStockUpdates();
    res.json(stockUpdates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stock updates by item ID
router.get("/item/:itemId", (req, res) => {
  try {
    const stockUpdates = stockUpdateService.getStockUpdatesByItemId(
      req.params.itemId
    );
    res.json(stockUpdates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stock updates by type
router.get("/type/:type", (req, res) => {
  try {
    const stockUpdates = stockUpdateService.getStockUpdatesByType(
      req.params.type
    );
    res.json(stockUpdates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stock updates by date range
router.get("/date-range", (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stockUpdates = stockUpdateService.getStockUpdatesByDateRange(
      startDate,
      endDate
    );
    res.json(stockUpdates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a specific stock update
router.put("/:id", (req, res) => {
  try {
    const { itemId, updatedQuantity, type, updateDate } = req.body;
    const result = stockUpdateService.updateStockUpdate(
      req.params.id,
      itemId,
      updatedQuantity,
      type,
      updateDate
    );
    if (result.changes) {
      res.json({ message: "Stock update updated successfully" });
    } else {
      res.status(404).json({ message: "Stock update not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a specific stock update
router.delete("/:id", (req, res) => {
  try {
    const result = stockUpdateService.deleteStockUpdate(req.params.id);
    if (result.changes) {
      res.json({ message: "Stock update deleted successfully" });
    } else {
      res.status(404).json({ message: "Stock update not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
