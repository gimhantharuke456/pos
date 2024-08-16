// routes/returnRoutes.js
const express = require("express");
const router = express.Router();
const returnService = require("../services/returnsService");

// Create customer return
router.post("/customer", async (req, res) => {
  try {
    const { orderId, returnItems } = req.body;
    const result = await returnService.createCustomerReturn(
      orderId,
      returnItems
    );
    res
      .status(201)
      .json({ id: result, message: "Customer return created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all customer returns
router.get("/customer", (req, res) => {
  const customerReturns = returnService.getCustomerReturns();
  res.json(customerReturns);
});

// Get customer return by id
router.get("/customer/:id", (req, res) => {
  const customerReturn = returnService.getCustomerReturnById(req.params.id);
  if (customerReturn) {
    res.json(customerReturn);
  } else {
    res.status(404).json({ error: "Customer return not found" });
  }
});

// Create supplier return
router.post("/supplier", async (req, res) => {
  try {
    const { supplierId, returnItems } = req.body;
    const result = await returnService.createSupplierReturn(
      supplierId,
      returnItems
    );
    res
      .status(201)
      .json({ id: result, message: "Supplier return created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all supplier returns
router.get("/supplier", (req, res) => {
  const supplierReturns = returnService.getSupplierReturns();
  res.json(supplierReturns);
});

// Get supplier return by id
router.get("/supplier/:id", (req, res) => {
  const supplierReturn = returnService.getSupplierReturnById(req.params.id);
  if (supplierReturn) {
    res.json(supplierReturn);
  } else {
    res.status(404).json({ error: "Supplier return not found" });
  }
});

// Get non-salable items
router.get("/non-salable", (req, res) => {
  const nonSalableItems = returnService.getNonSalableItems();
  res.json(nonSalableItems);
});

module.exports = router;
