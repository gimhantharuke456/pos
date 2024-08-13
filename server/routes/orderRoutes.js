const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService");

// Create a new order
router.post("/", async (req, res) => {
  try {
    const { customerId, paymentMethod, items, totalAmount } = req.body;
    const orderId = await orderService.createOrder(
      customerId,
      paymentMethod,
      items,
      totalAmount
    );
    res
      .status(201)
      .json({ message: "Order created successfully", orderId, totalAmount });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an order
router.put("/:id", async (req, res) => {
  try {
    const { customerId, paymentMethod, items, paymentStatus, paidAmount } =
      req.body;
    const updatedOrderId = await orderService.updateOrder(
      req.params.id,
      customerId,
      paymentMethod,
      items,
      paymentStatus,
      paidAmount
    );
    res.json({
      message: "Order updated successfully",
      orderId: updatedOrderId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an order (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch("/:orderId/paidAmount", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paidAmount } = req.body;
    const result = await orderService.updatePaidAmount(orderId, paidAmount);
    res.json(result);
  } catch (error) {
    res.status(500).send("Error updating paid amount: " + error.message);
  }
});

// Update Payment Status
router.patch("/:orderId/paymentStatus", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;
    const result = await orderService.updatePaymentStatus(
      orderId,
      paymentStatus
    );
    res.json(result);
  } catch (error) {
    res.status(500).send("Error updating payment status: " + error.message);
  }
});

module.exports = router;
