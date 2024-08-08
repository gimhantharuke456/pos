const initializeDb = require("../db/initializeDb");

const db = initializeDb();

const purchaseOrderModel = {
  getAllPurchaseOrders: () => {
    return db
      .prepare(
        `
      SELECT po.*, s.name as supplierName
      FROM purchaseOrders po
      JOIN suppliers s ON po.supplierId = s.id
    WHERE po.status <> 'DELETED'
    `
      )
      .all();
  },

  getPurchaseOrderById: (id) => {
    return db
      .prepare(
        `
      SELECT po.*, s.name as supplierName
      FROM purchaseOrders po
      JOIN suppliers s ON po.supplierId = s.id
      WHERE po.id = ?
    `
      )
      .get(id);
  },

  createPurchaseOrder: (orderDate, status, supplierId) => {
    const info = db
      .prepare(
        `
      INSERT INTO purchaseOrders (orderDate, status, supplierId)
      VALUES (?, ?, ?)
    `
      )
      .run(orderDate, status, supplierId);
    return info.lastInsertRowid;
  },

  updatePurchaseOrder: (id, orderDate, status, supplierId) => {
    return db
      .prepare(
        `
      UPDATE purchaseOrders
      SET orderDate = ?, status = ?, supplierId = ?
      WHERE id = ?
    `
      )
      .run(orderDate, status, supplierId, id);
  },

  deletePurchaseOrder: async (id) => {
    try {
      return db
        .prepare(
          `
        UPDATE purchaseOrders
        SET  status = 'DELETED'
        WHERE id = ?
      `
        )
        .run(id);
    } catch (error) {
      console.log("Error deleting purchase order items:", error);
    }
  },

  addPurchaseOrderItem: (purchaseOrderId, itemId, quantity) => {
    try {
      return db
        .prepare(
          `
      INSERT INTO purchaseOrderItems (purchaseOrderId, itemId, quantity)
      VALUES (?, ?, ?)
    `
        )
        .run(purchaseOrderId, itemId, quantity);
    } catch (error) {
      console.error("Error adding purchase order item:", error);
    }
  },

  getPurchaseOrderItems: async (purchaseOrderId) => {
    return await db
      .prepare(
        `
      SELECT poi.*, i.itemName, i.unitPrice
      FROM purchaseOrderItems poi
      JOIN items i ON poi.itemId = i.id
      WHERE poi.purchaseOrderId = ?
    `
      )
      .all(purchaseOrderId);
  },
};

module.exports = purchaseOrderModel;
