// controllers/reportController.js
const db = require("../db/initializeDb");

exports.getStockReport = (req, res) => {
  const { supplierId, fromDate, toDate } = req.query;

  let query = `
    SELECT 
      i.id as itemId,
      i.itemName,
      i.itemCode,
      i.unitType,
      s.name as supplierName,
      d.inStockAmount,
      i.createdAt,
      i.updatedAt
    FROM items i
    JOIN suppliers s ON i.supplierId = s.id
    LEFT JOIN distributions d ON i.id = d.itemId
    WHERE i.deleteStatus = FALSE
  `;

  const params = [];

  if (supplierId) {
    query += " AND i.supplierId = ?";
    params.push(supplierId);
  }

  if (fromDate) {
    query += " AND i.createdAt >= ?";
    params.push(fromDate);
  }

  if (toDate) {
    query += " AND i.createdAt <= ?";
    params.push(toDate);
  }

  query += " ORDER BY i.itemName";

  try {
    const stmt = db().prepare(query);
    const results = stmt.all(...params);
    res.json(results);
  } catch (error) {
    console.error("Error fetching stock report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
