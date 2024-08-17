const initializeDb = require("../db/initializeDb");

const db = initializeDb();

const distributionService = {
  createDistribution: async (itemId, inStockAmount) => {
    const existingDistribution = db
      .prepare("SELECT * FROM distributions WHERE itemId = ?")
      .get(itemId);

    if (existingDistribution) {
      db.prepare(
        "UPDATE distributions SET inStockAmount = inStockAmount + ? WHERE itemId = ?"
      ).run(inStockAmount, itemId);
      return { distributionId: existingDistribution.id };
    } else {
      const info = db
        .prepare(
          "INSERT INTO distributions (itemId, inStockAmount) VALUES (?, ?)"
        )
        .run(itemId, inStockAmount);
      return { distributionId: info.lastInsertRowid };
    }
  },

  getDistributionById: (id) => {
    const distribution = db
      .prepare(
        `SELECT d.*, i.*, s.name as supplierName, s.supplierCode
         FROM distributions d
         JOIN items i ON d.itemId = i.id
         JOIN suppliers s ON i.supplierId = s.id
         WHERE d.id = ?`
      )
      .get(id);

    return distribution;
  },
  getDistributionByItemId: (id) => {
    const distribution = db
      .prepare(
        `SELECT d.*, i.*, s.name as supplierName, s.supplierCode
         FROM distributions d
         JOIN items i ON d.itemId = i.id
         JOIN suppliers s ON i.supplierId = s.id
         WHERE d.itemId = ?`
      )
      .get(id);

    return distribution;
  },

  getAllDistributions: () => {
    return db
      .prepare(
        `SELECT d.*, i.*, s.name as supplierName, s.supplierCode, d.id as distributionId
         FROM distributions d
         JOIN items i ON d.itemId = i.id
         JOIN suppliers s ON i.supplierId = s.id`
      )
      .all();
  },

  updateDistribution: async (id, inStockAmount) => {
    try {
      return await db
        .prepare("UPDATE distributions SET inStockAmount = ? WHERE id = ?")
        .run(inStockAmount, id);
    } catch (error) {
      console.error("Error updating distribution:", error);
    }
  },

  deleteDistribution: (id) => {
    return db.prepare("DELETE FROM distributions WHERE id = ?").run(id);
  },
};

module.exports = distributionService;
