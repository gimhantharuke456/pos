// item.js (route file)
const express = require("express");
const itemService = require("../services/itemService");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(itemService.getAllItems());
});

router.get("/search", (req, res) => {
  const { name } = req.query;
  res.json(itemService.getItemByName(name));
});

router.post("/", (req, res) => {
  const id = itemService.addItem(req.body);
  res.json({ id });
});

router.put("/:id", (req, res) => {
  itemService.updateItem(req.params.id, req.body);
  res.json({ message: "Item updated successfully" });
});

router.delete("/:id", (req, res) => {
  itemService.deleteItem(req.params.id);
  res.json({ message: "Item deleted successfully" });
});

module.exports = router;
