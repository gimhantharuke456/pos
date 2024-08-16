// itemService.js
const initializeDb = require("../db/initializeDb");

const db = initializeDb();

const calculateWholesalePrice = (unitPrice, discount1, discount2) => {
  const priceAfterDiscount1 = unitPrice * (1 - discount1 / 100);
  const wholesalePrice = priceAfterDiscount1 * (1 - discount2 / 100);
  return Number(wholesalePrice.toFixed(2));
};
const calculateSecondePrice = (unitPrice, discount1) => {
  const priceAfterDiscount1 = unitPrice * (1 - discount1 / 100);

  return Number(priceAfterDiscount1.toFixed(2));
};

const itemService = {
  getAllItems() {
    return db
      .prepare(
        `
      SELECT i.itemCode, i.id, i.itemName, i.unitType, i.unitPrice, i.secondPrice,i.discountPercentage1, i.discountPercentage2, i.wholesalePrice, s.name as supplier,s.id as supplierId
      FROM items i
      LEFT JOIN suppliers s ON i.supplierId = s.id
      WHERE i.deleteStatus is FALSE
    `
      )
      .all();
  },

  getItemByName(name) {
    return db
      .prepare(
        `
      SELECT i.id, i.itemName, i.unitType, i.unitPrice, i.discountPercentage1, i.discountPercentage2, i.wholesalePrice, i.secondPrice, s.name as supplier
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
      itemCode,
    } = item;
    const wholesalePrice = calculateWholesalePrice(
      unitPrice,
      discountPercentage1,
      discountPercentage2
    );

    const secondPrice = calculateSecondePrice(unitPrice, discountPercentage1);

    const info = db
      .prepare(
        "INSERT INTO items (itemCode, itemName, unitType, unitPrice, discountPercentage1, discountPercentage2, supplierId, wholesalePrice,secondPrice) VALUES (?,?, ?, ?, ?, ?, ?, ?,?)"
      )
      .run(
        itemCode,
        itemName,
        unitType,
        unitPrice,
        discountPercentage1,
        discountPercentage2,
        supplier,
        wholesalePrice,
        secondPrice
      );
    return info.lastInsertRowid;
  },

  updateItem(id, item) {
    const {
      itemCode,
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

    const secondPrice = calculateSecondePrice(unitPrice, discountPercentage1);

    db.prepare(
      "UPDATE items SET itemCode = ?, itemName = ?, unitType = ?, unitPrice = ?, discountPercentage1 = ?, discountPercentage2 = ?, wholesalePrice = ? , secondPrice = ? WHERE id = ?"
    ).run(
      itemCode,
      itemName,
      unitType,
      unitPrice,
      discountPercentage1,
      discountPercentage2,
      wholesalePrice,
      secondPrice,
      id
    );
  },

  deleteItem(id) {
    db.prepare("UPDATE items SET deleteStatus = TRUE  WHERE id = ?").run(id);
  },
};

module.exports = itemService;
