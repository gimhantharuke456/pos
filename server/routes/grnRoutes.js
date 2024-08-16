// grnRoutes.js
const express = require("express");
const router = express.Router();
const grnService = require("../services/grnService");

// Create a new GRN
router.post("/", async (req, res) => {
  try {
    const { purchaseOrderId, receiveDate, items, goodReceivedNoteCode } =
      req.body;
    const result = grnService.createGRN(
      purchaseOrderId,
      receiveDate,
      items,
      goodReceivedNoteCode
    );
    res.status(201).json({
      message: "GRN created successfully",
      grnId: result.grnId,
      newPurchaseOrderId: result.newPurchaseOrderId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific GRN
router.get("/:id", (req, res) => {
  try {
    const grn = grnService.getGRNById(req.params.id);
    if (grn) {
      res.json(grn);
    } else {
      res.status(404).json({ message: "GRN not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all GRNs
router.get("/", (req, res) => {
  try {
    const grns = grnService.getAllGRNs();
    res.json(grns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update GRN status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const result = await grnService.updateGRNStatus(req.params.id, status);
    console.log(result);
    if (result.changes) {
      res.json({ message: "GRN status updated successfully" });
    } else {
      res.status(404).json({ message: "GRN not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
