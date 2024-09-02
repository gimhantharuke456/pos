// services/stockUpdateService.js

const initializeDb = require("../db/initializeDb");

const db = initializeDb();

const stockUpdateService = {
  createStockUpdate: async (
    itemId,
    updatedQuantity,
    type,
    updateDate = null
  ) => {
    const info = await db
      .prepare(
        "INSERT INTO stockUpdates (itemId, updatedQuantity, type, updateDate) VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))"
      )
      .run(itemId, updatedQuantity, type, updateDate);

    return { stockUpdateId: info.lastInsertRowid };
  },

  getStockUpdateById: (id) => {
    return db.prepare("SELECT * FROM stockUpdates WHERE id = ?").get(id);
  },

  getAllStockUpdates: () => {
    return db
      .prepare(
        `
      SELECT 
        su.id, 
        su.itemId, 
        su.updatedQuantity, 
        su.type, 
        su.updateDate, 
        i.itemName, 
        i.itemCode 
      FROM 
        stockUpdates su 
      JOIN 
        items i 
      ON 
        su.itemId = i.id
      `
      )
      .all();
  },

  getStockUpdatesByItemId: (itemId) => {
    return db
      .prepare("SELECT * FROM stockUpdates WHERE itemId = ?")
      .all(itemId);
  },

  getStockUpdatesByType: (type) => {
    return db.prepare("SELECT * FROM stockUpdates WHERE type = ?").all(type);
  },

  getStockUpdatesByDateRange: (startDate, endDate) => {
    return db
      .prepare("SELECT * FROM stockUpdates WHERE updateDate BETWEEN ? AND ?")
      .all(startDate, endDate);
  },

  updateStockUpdate: (id, itemId, updatedQuantity, type, updateDate = null) => {
    return db
      .prepare(
        "UPDATE stockUpdates SET itemId = ?, updatedQuantity = ?, type = ?, updateDate = COALESCE(?, CURRENT_TIMESTAMP), updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .run(itemId, updatedQuantity, type, updateDate, id);
  },

  deleteStockUpdate: (id) => {
    return db.prepare("DELETE FROM stockUpdates WHERE id = ?").run(id);
  },
};

module.exports = stockUpdateService;
