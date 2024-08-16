const initializeDb = require("../db/initializeDb");
const db = initializeDb();

const orderService = {
  // Create a new order
  createOrder: async (
    customerId,
    paymentMethod,
    items,
    totalAmount,
    orderDate,
    orderCode
  ) => {
    return db.transaction(async () => {
      // Insert order
      const orderInfo = await db
        .prepare(
          "INSERT INTO orders (customerId, paymentMethod, totalAmount, discount,  paidAmount, paymentStatus,orderDate,orderCode) VALUES (?, ?, ?, ?, ?, ?,?,?)"
        )
        .run(
          customerId,
          paymentMethod,
          totalAmount,
          discount,
          0,
          "pending",
          orderDate,
          orderCode
        );
      const orderId = orderInfo.lastInsertRowid;

      // Insert order items
      const insertOrderItem = db.prepare(
        "INSERT INTO orderItems (orderId, itemId, quantity,discount1,discount2 ,itemPrice) VALUES (?, ?,?, ?,?, ?)"
      );

      const updateDistribution = db.prepare(
        "UPDATE distributions SET inStockAmount = ? WHERE itemId = ?"
      );
      const distribution = db.prepare(
        "SELECT * FROM distributions WHERE itemId = ?"
      );
      for (const item of items) {
        const dItem = distribution.run(item.id);

        const newQuantity = dItem.inStockAmount ?? 10 - item.quantity;

        await updateDistribution.run(newQuantity, item.id);

        await insertOrderItem.run(
          orderId,
          item.id,
          item.quantity,
          item.discount1,
          item.discount2,
          item.secondPrice
        );
      }

      return orderId;
    })();
  },

  // Get a specific order by ID
  getOrderById: async (id) => {
    const order = await db
      .prepare(
        `SELECT o.*, c.name as customerName 
         FROM orders o 
         JOIN customers c ON o.customerId = c.id 
         WHERE o.id = ? AND o.deleteStatus = false`
      )
      .get(id);

    if (order) {
      order.items = await db
        .prepare(
          `SELECT oi.*, i.itemName 
           FROM orderItems oi 
           JOIN items i ON oi.itemId = i.id 
           WHERE oi.orderId = ?`
        )
        .all(id);
    }

    return order;
  },

  // Get all orders
  getAllOrders: async () => {
    const orders = await db
      .prepare(
        `SELECT o.*, c.name as customerName , c.customerCode 
         FROM orders o 
         JOIN customers c ON o.customerId = c.id 
         WHERE o.deleteStatus = false`
      )
      .all();

    for (const order of orders) {
      order.items = await db
        .prepare(
          `SELECT oi.*, i.* 
           FROM orderItems oi 
           JOIN items i ON oi.itemId = i.id 
           WHERE oi.orderId = ?`
        )
        .all(order.id);
    }

    return orders;
  },

  // Update order
  updateOrder: async (
    id,
    customerId,
    paymentMethod,
    items,
    paymentStatus,
    paidAmount
  ) => {
    return db.transaction(async () => {
      // Calculate total amount again if items or payment method changed
      let totalAmount = 0;

      for (const item of items) {
        const itemData = await db
          .prepare("SELECT * FROM items WHERE id = ?")
          .get(item.itemId);
        totalAmount += item.quantity * itemData.unitPrice;
      }

      let discount = 0;
      if (paymentMethod === "cash") {
        discount = 0.1 * totalAmount;
        totalAmount -= discount;
      }

      // Calculate outstanding amount
      const outstandingAmount = totalAmount - paidAmount;

      await db
        .prepare(
          "UPDATE orders SET customerId = ?, paymentMethod = ?, totalAmount = ?, discount = ?, outstandingAmount = ?, paidAmount = ?, paymentStatus = ? WHERE id = ? AND deleteStatus = false"
        )
        .run(
          customerId,
          paymentMethod,
          totalAmount,
          discount,
          outstandingAmount,
          paidAmount,
          paymentStatus,
          id
        );

      // Update order items
      await db.prepare("DELETE FROM orderItems WHERE orderId = ?").run(id);
      const insertOrderItem = db.prepare(
        "INSERT INTO orderItems (orderId, itemId, quantity, price) VALUES (?, ?, ?, ?)"
      );

      for (const item of items) {
        await insertOrderItem.run(
          id,
          item.itemId,
          item.quantity,
          item.quantity * item.unitPrice
        );
      }

      return id;
    })();
  },

  // Soft delete order
  deleteOrder: async (id) => {
    await db
      .prepare("UPDATE orders SET deleteStatus = true WHERE id = ?")
      .run(id);
  },
  updatePaidAmount: async (orderId, paidAmount) => {
    return db.transaction(async () => {
      // Fetch the current order details
      const order = await db
        .prepare("SELECT * FROM orders WHERE id = ?")
        .get(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      // Calculate new paid amount and outstanding amount
      const newPaidAmount = order.paidAmount + paidAmount;
      const newOutstandingAmount = order.totalAmount - newPaidAmount;

      // Update the order with the new paid amount
      await db
        .prepare("UPDATE orders SET paidAmount = ? WHERE id = ?")
        .run(newPaidAmount, orderId);

      return {
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstandingAmount,
      };
    })();
  },
  updatePaymentStatus: async (orderId, paymentStatus) => {
    return db.transaction(async () => {
      // Check if the provided status is valid
      const validStatuses = ["pending", "accepted", "partially paid"];
      if (!validStatuses.includes(paymentStatus)) {
        throw new Error("Invalid payment status");
      }

      // Update the payment status
      await db
        .prepare("UPDATE orders SET paymentStatus = ? WHERE id = ?")
        .run(paymentStatus, orderId);

      return { paymentStatus };
    })();
  },
};

module.exports = orderService;
