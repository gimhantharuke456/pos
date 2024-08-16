const initializeDb = require("../db/initializeDb");
const db = initializeDb();
const returnService = {
  createCustomerReturn: async (orderId, returnItems) => {
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    if (!order) throw new Error("Order not found");

    let returnTotal = 0;
    let items = [];

    for (const item of returnItems) {
      items.push({ ...item, isSalable: item.isSalable ? 1 : 0 });
    }

    const result = db.transaction(() => {
      const { lastInsertRowid } = db
        .prepare(
          "INSERT INTO customerReturns (orderId, totalAmount) VALUES (?, ?)"
        )
        .run(orderId, returnTotal);

      for (const item of items) {
        db.prepare(
          "INSERT INTO customerReturnItems (customerReturnId, itemId, quantity, isSalable, reason) VALUES (?, ?, ?, ?, ?)"
        ).run(
          lastInsertRowid,
          item.itemId,
          item.quantity,
          item.isSalable,
          item.reason
        );

        // Update order item quantity
        db.prepare(
          "UPDATE orderItems SET quantity = quantity - ? WHERE orderId = ? AND itemId = ?"
        ).run(item.quantity, orderId, item.itemId);

        // Update stock for salable items
        if (item.isSalable) {
          db.prepare(
            "UPDATE distributions SET inStockAmount = inStockAmount + ? WHERE itemId = ?"
          ).run(item.quantity, item.itemId);
        }
      }

      // Update order total amount
      db.prepare(
        "UPDATE orders SET totalAmount = totalAmount - ? WHERE id = ?"
      ).run(returnTotal, orderId);

      return lastInsertRowid;
    })();

    return result;
  },

  getCustomerReturns: () => {
    return db.prepare("SELECT * FROM customerReturns").all();
  },

  getCustomerReturnById: (id) => {
    const customerReturn = db
      .prepare("SELECT * FROM customerReturns WHERE id = ?")
      .get(id);
    if (!customerReturn) return null;

    const returnItems = db
      .prepare("SELECT * FROM customerReturnItems WHERE customerReturnId = ?")
      .all(id);
    return { ...customerReturn, items: returnItems };
  },

  createSupplierReturn: async (supplierId, returnItems) => {
    const supplier = db
      .prepare("SELECT * FROM suppliers WHERE id = ?")
      .get(supplierId);
    if (!supplier) throw new Error("Supplier not found");

    const result = db.transaction(() => {
      const { lastInsertRowid } = db
        .prepare("INSERT INTO supplierReturns (supplierId) VALUES (?)")
        .run(supplierId);

      for (const item of returnItems) {
        db.prepare(
          "INSERT INTO supplierReturnItems (supplierReturnId, itemId, quantity, reason) VALUES (?, ?, ?, ?)"
        ).run(lastInsertRowid, item.itemId, item.quantity, item.reason);

        // Remove non-salable items from stock
        db.prepare(
          "UPDATE distributions SET inStockAmount = inStockAmount - ? WHERE itemId = ?"
        ).run(item.quantity, item.itemId);
      }

      return lastInsertRowid;
    })();

    return result;
  },

  getSupplierReturns: () => {
    return db.prepare("SELECT * FROM supplierReturns").all();
  },

  getSupplierReturnById: (id) => {
    const supplierReturn = db
      .prepare("SELECT * FROM supplierReturns WHERE id = ?")
      .get(id);
    if (!supplierReturn) return null;

    const returnItems = db
      .prepare("SELECT * FROM supplierReturnItems WHERE supplierReturnId = ?")
      .all(id);
    return { ...supplierReturn, items: returnItems };
  },

  getNonSalableItems: () => {
    return db
      .prepare(
        `
      SELECT i.*, cri.quantity, cri.reason
      FROM items i
      JOIN customerReturnItems cri ON i.id = cri.itemId
      WHERE cri.isSalable = 0
    `
      )
      .all();
  },
};

module.exports = returnService;
