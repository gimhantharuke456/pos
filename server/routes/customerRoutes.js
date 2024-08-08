const express = require("express");
const customerService = require("../services/customerService");

const router = express.Router();

// Create a new customer
router.post("/", (req, res) => {
  try {
    const { name, contactNumber, address, email } = req.body;
    const result = customerService.createCustomer(
      name,
      contactNumber,
      address,
      email
    );
    res
      .status(201)
      .json({
        message: "Customer created successfully",
        customerId: result.customerId,
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific customer by ID
router.get("/:id", (req, res) => {
  try {
    const customer = customerService.getCustomerById(req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all customers
router.get("/", (req, res) => {
  try {
    const customers = customerService.getAllCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a specific customer
router.put("/:id", (req, res) => {
  try {
    const { name, contactNumber, address, email } = req.body;
    const result = customerService.updateCustomer(
      req.params.id,
      name,
      contactNumber,
      address,
      email
    );
    if (result.changes) {
      res.json({ message: "Customer updated successfully" });
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Soft delete a specific customer
router.delete("/:id", (req, res) => {
  try {
    const result = customerService.deleteCustomer(req.params.id);
    if (result.changes) {
      res.json({ message: "Customer marked as deleted successfully" });
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
