const express = require("express");
const router = express.Router();
const purchaseOrderModel = require("../services/purchaseOrderModel");

// Get all purchase orders
router.get("/", (req, res) => {
  try {
    const purchaseOrders = purchaseOrderModel.getAllPurchaseOrders();
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new purchase order
router.post("/", async (req, res) => {
  try {
    const { orderDate, status, supplierId, items, purchaseOrderCode } =
      req.body;
    const purchaseOrderId = await purchaseOrderModel.createPurchaseOrder(
      orderDate,
      status,
      supplierId,
      purchaseOrderCode
    );

    for (let item of items) {
      purchaseOrderModel.addPurchaseOrderItem(
        purchaseOrderId,
        item.itemId,
        item.quantity
      );
    }

    res.status(201).json({ id: purchaseOrderId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific purchase order
router.get("/:id", async (req, res) => {
  try {
    const purchaseOrder = await purchaseOrderModel.getPurchaseOrderById(
      req.params.id
    );
    if (purchaseOrder) {
      const items = await purchaseOrderModel.getPurchaseOrderItems(
        req.params.id
      );

      purchaseOrder.items = items;
      res.json(purchaseOrder);
    } else {
      res.status(404).json({ message: "Purchase order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a purchase order
router.put("/:id", async (req, res) => {
  try {
    const { orderDate, status, supplierId } = req.body;
    const result = await purchaseOrderModel.updatePurchaseOrder(
      req.params.id,
      orderDate,
      status,
      supplierId
    );
    if (result.changes) {
      res.json({ message: "Purchase order updated" });
    } else {
      res.status(404).json({ message: "Purchase order not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a purchase order
router.delete("/:id", async (req, res) => {
  try {
    const result = await purchaseOrderModel.deletePurchaseOrder(req.params.id);

    if (result.changes) {
      res.json({ message: "Purchase order deleted" });
    } else {
      res.status(404).json({ message: "Purchase order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
