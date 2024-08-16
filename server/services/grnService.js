// grnService.js
const initializeDb = require("../db/initializeDb");
const { createDistribution } = require("./distributionService");
const purchaseOrderModel = require("./purchaseOrderModel");

const db = initializeDb();

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const grnService = {
  createGRN: (purchaseOrderId, receiveDate, items, goodReceivedNoteCode) => {
    let newPOId = null;
    const transaction = db.transaction(async () => {
      // Create GRN
      const grnInfo = db
        .prepare(
          "INSERT INTO goodsReceivedNotes (purchaseOrderId, receiveDate, status,goodReceivedNoteCode) VALUES (?, ?, ?,?)"
        )
        .run(purchaseOrderId, receiveDate, "PENDING", goodReceivedNoteCode);

      const grnId = grnInfo.lastInsertRowid;

      // Insert GRN items
      const insertGRNItem = db.prepare(
        "INSERT INTO goodsReceivedItems (goodsReceivedNoteId, itemId, orderedQuantity, receivedQuantity) VALUES (?, ?, ?, ?)"
      );

      let quantityMismatch = false;

      const order = await purchaseOrderModel.getPurchaseOrderById(
        purchaseOrderId
      );

      for (const item of items) {
        insertGRNItem.run(
          grnId,
          item.itemId,
          item.orderedQuantity,
          item.receivedQuantity
        );

        if (item.orderedQuantity != item.receivedQuantity) {
          quantityMismatch = true;
        }
      }

      // Update purchase order status
      if (quantityMismatch) {
        db.prepare("UPDATE purchaseOrders SET status = ? WHERE id = ?").run(
          "IGNORED",
          purchaseOrderId
        );

        // Create new purchase order with mismatched quantities
        const newPOInfo = purchaseOrderModel.createPurchaseOrder(
          formatDate(new Date()),
          "PENDING",
          order.supplierId
        );
        newPOId = newPOInfo;
        const insertNewPOItem = db.prepare(
          "INSERT INTO purchaseOrderItems (purchaseOrderId, itemId, quantity) VALUES (?, ?, ?)"
        );

        for (const item of items) {
          insertNewPOItem.run(newPOInfo, item.itemId, item.receivedQuantity);
        }
      } else {
        db.prepare("UPDATE purchaseOrders SET status = ? WHERE id = ?").run(
          "COMPLETED",
          purchaseOrderId
        );
      }

      return { grnId, newPurchaseOrderId: quantityMismatch ? newPOId : null };
    });

    return transaction();
  },

  getGRNById: (id) => {
    const grn = db
      .prepare(
        `SELECT grn.*, po.purchaseOrderCode ,po.supplierId, s.supplierCode 
       FROM goodsReceivedNotes grn
       JOIN purchaseOrders po ON grn.purchaseOrderId = po.id
       JOIN suppliers s ON po.supplierId = s.id
       WHERE grn.id = ?`
      )
      .get(id);

    if (grn) {
      grn.items = db
        .prepare(
          `SELECT gri.*, i.*
           FROM goodsReceivedItems gri
           JOIN items i ON gri.itemId = i.id
           WHERE gri.goodsReceivedNoteId = ?`
        )
        .all(id);
    }

    return grn;
  },

  getAllGRNs: () => {
    return db
      .prepare(
        `SELECT grn.*, po.supplierId, s.name as supplierName, s.supplierCode,po.purchaseOrderCode
       FROM goodsReceivedNotes grn
       JOIN purchaseOrders po ON grn.purchaseOrderId = po.id
       JOIN suppliers s ON po.supplierId = s.id
       WHERE grn.status <> 'DELETED'
       `
      )
      .all();
  },

  updateGRNStatus: async (id, status) => {
    if (status === "ACCEPTED") {
      try {
        const grn = db
          .prepare(
            `SELECT grn.*, po.supplierId
           FROM goodsReceivedNotes grn
           JOIN purchaseOrders po ON grn.purchaseOrderId = po.id
           WHERE grn.id = ?`
          )
          .get(id);

        if (grn) {
          grn.items = db
            .prepare(
              `SELECT gri.*, i.itemName
             FROM goodsReceivedItems gri
             JOIN items i ON gri.itemId = i.id
             WHERE gri.goodsReceivedNoteId = ?`
            )
            .all(id);
        }
        const items = grn.items;
        for (var item of items) {
          await createDistribution(item.itemId, item.receivedQuantity);
        }
        console.log("distributions added");
      } catch (err) {
        console.error("Error creating distribution:", err);
      }
    }
    return db
      .prepare("UPDATE goodsReceivedNotes SET status = ? WHERE id = ?")
      .run(status, id);
  },
};

module.exports = grnService;
