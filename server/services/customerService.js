const initializeDb = require("../db/initializeDb");

const db = initializeDb();

const customerService = {
  createCustomer: (name, contactNumber, address, email, customerCode) => {
    const info = db
      .prepare(
        "INSERT INTO customers (name, contactNumber, address, email,customerCode) VALUES (?, ?, ?, ?,?)"
      )
      .run(name, contactNumber, address, email, customerCode);

    return { customerId: info.lastInsertRowid };
  },

  getCustomerById: (id) => {
    return db
      .prepare("SELECT * FROM customers WHERE id = ? AND deleteStatus = FALSE")
      .get(id);
  },

  getAllCustomers: () => {
    return db
      .prepare("SELECT * FROM customers WHERE deleteStatus = FALSE")
      .all();
  },

  updateCustomer: (id, name, contactNumber, address, email) => {
    return db
      .prepare(
        "UPDATE customers SET name = ?, contactNumber = ?, address = ?, email = ? WHERE id = ? AND deleteStatus = FALSE"
      )
      .run(name, contactNumber, address, email, id);
  },

  deleteCustomer: (id) => {
    return db
      .prepare("UPDATE customers SET deleteStatus = TRUE WHERE id = ?")
      .run(id);
  },
};

module.exports = customerService;
