const initializeDb = require("../db/initializeDb");

const db = initializeDb();

const supplierService = {
  getAllSuppliers() {
    return db.prepare("SELECT * FROM suppliers").all();
  },

  getSupplierByName(name) {
    return db
      .prepare("SELECT * FROM suppliers WHERE name LIKE ?")
      .all(`%${name}%`);
  },

  addSupplier(supplier) {
    const { name, contactNumber, address, email } = supplier;
    const info = db
      .prepare(
        "INSERT INTO suppliers (name, contactNumber, address, email) VALUES (?, ?, ?, ?)"
      )
      .run(name, contactNumber, address, email);
    return info.lastInsertRowid;
  },

  updateSupplier(id, supplier) {
    const { name, contactNumber, address, email } = supplier;
    db.prepare(
      "UPDATE suppliers SET name = ?, contactNumber = ?, address = ?, email = ? WHERE id = ?"
    ).run(name, contactNumber, address, email, id);
  },

  deleteSupplier(id) {
    db.prepare("DELETE FROM suppliers WHERE id = ?").run(id);
  },
};

module.exports = supplierService;
