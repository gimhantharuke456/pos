// itemService.js
const initializeDb = require("../db/initializeDb");

const db = initializeDb();

const calculateWholesalePrice = (unitPrice, discount1, discount2) => {
  const priceAfterDiscount1 = unitPrice * (1 - discount1 / 100);
  const wholesalePrice = priceAfterDiscount1 * (1 - discount2 / 100);
  return Number(wholesalePrice.toFixed(2));
};

const itemService = {
  getAllItems() {
    return db
      .prepare(
        `
      SELECT i.id, i.itemName, i.unitType, i.unitPrice, i.discountPercentage1, i.discountPercentage2, i.wholesalePrice, s.name as supplier
      FROM items i
      LEFT JOIN suppliers s ON i.supplierId = s.id
    `
      )
      .all();
  },

  getItemByName(name) {
    return db
      .prepare(
        `
      SELECT i.id, i.itemName, i.unitType, i.unitPrice, i.discountPercentage1, i.discountPercentage2, i.wholesalePrice, s.name as supplier
      FROM items i
      LEFT JOIN suppliers s ON i.supplierId = s.id
      WHERE i.itemName LIKE ?
    `
      )
      .all(`%${name}%`);
  },

  addItem(item) {
    const {
      itemName,
      unitType,
      unitPrice,
      discountPercentage1,
      discountPercentage2,
      supplier,
    } = item;
    const wholesalePrice = calculateWholesalePrice(
      unitPrice,
      discountPercentage1,
      discountPercentage2
    );

    const info = db
      .prepare(
        "INSERT INTO items (itemName, unitType, unitPrice, discountPercentage1, discountPercentage2, supplierId, wholesalePrice) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        itemName,
        unitType,
        unitPrice,
        discountPercentage1,
        discountPercentage2,
        supplier,
        wholesalePrice
      );
    return info.lastInsertRowid;
  },

  updateItem(id, item) {
    const {
      itemName,
      unitType,
      unitPrice,
      discountPercentage1,
      discountPercentage2,
    } = item;
    const wholesalePrice = calculateWholesalePrice(
      unitPrice,
      discountPercentage1,
      discountPercentage2
    );

    db.prepare(
      "UPDATE items SET itemName = ?, unitType = ?, unitPrice = ?, discountPercentage1 = ?, discountPercentage2 = ?, wholesalePrice = ? WHERE id = ?"
    ).run(
      itemName,
      unitType,
      unitPrice,
      discountPercentage1,
      discountPercentage2,
      wholesalePrice,
      id
    );
  },

  deleteItem(id) {
    db.prepare("DELETE FROM items WHERE id = ?").run(id);
  },
};

module.exports = itemService;
