// returnsService.js
const initializeDb = require("../db/initializeDb");

const db = initializeDb();

const returnsService = {
  createReturn: (returnData) => {
    const { orderId, itemId, quantity, reason, status } = returnData;
    const stmt = db.prepare(`
      INSERT INTO returns (orderId, itemId, quantity, reason, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(orderId, itemId, quantity, reason, status);

    if (status === "reusable") {
      const updateDistributionStmt = db.prepare(`
        UPDATE distributions
        SET inStockAmount = inStockAmount + ?
        WHERE itemId = ?
      `);
      updateDistributionStmt.run(quantity, itemId);
    }

    return result.lastInsertRowid;
  },

  getReturns: () => {
    const stmt = db.prepare(`
      SELECT r.*, i.itemName, o.customerId
      FROM returns r
      JOIN items i ON r.itemId = i.id
      JOIN orders o ON r.orderId = o.id
    `);
    return stmt.all();
  },

  getReturnsByStatus: (status) => {
    const stmt = db.prepare(`
      SELECT r.*, i.itemName, o.customerId
      FROM returns r
      JOIN items i ON r.itemId = i.id
      JOIN orders o ON r.orderId = o.id
      WHERE r.status = ?
    `);
    return stmt.all(status);
  },

  getReturnCountByItem: () => {
    const stmt = db.prepare(`
      SELECT i.itemName, r.status, COUNT(*) as count, SUM(r.quantity) as totalQuantity
      FROM returns r
      JOIN items i ON r.itemId = i.id
      GROUP BY i.id, r.status
    `);
    return stmt.all();
  },
};

module.exports = returnsService;
