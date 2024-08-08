const express = require("express");
const supplierService = require("../services/supplierService");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(supplierService.getAllSuppliers());
});

router.get("/search", (req, res) => {
  const { name } = req.query;
  res.json(supplierService.getSupplierByName(name));
});

router.post("/", (req, res) => {
  const id = supplierService.addSupplier(req.body);
  res.json({ id });
});

router.put("/:id", (req, res) => {
  supplierService.updateSupplier(req.params.id, req.body);
  res.json({ message: "Supplier updated successfully" });
});

router.delete("/:id", (req, res) => {
  supplierService.deleteSupplier(req.params.id);
  res.json({ message: "Supplier deleted successfully" });
});

module.exports = router;
