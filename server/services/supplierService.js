const initializeDb = require("../db/initializeDb");

const db = initializeDb();

const supplierService = {
  getAllSuppliers() {
    return db
      .prepare("SELECT * FROM suppliers WHERE deleteStatus is FALSE")
      .all();
  },

  getSupplierByName(name) {
    return db
      .prepare("SELECT * FROM suppliers WHERE name LIKE ?")
      .all(`%${name}%`);
  },

  addSupplier(supplier) {
    const { name, contactNumber, address, email, supplierCode } = supplier;
    const info = db
      .prepare(
        "INSERT INTO suppliers (name, contactNumber, address, email,supplierCode) VALUES (?, ?, ?, ?,?)"
      )
      .run(name, contactNumber, address, email, supplierCode);
    return info.lastInsertRowid;
  },

  updateSupplier(id, supplier) {
    const { name, contactNumber, address, email, supplierCode } = supplier;
    db.prepare(
      "UPDATE suppliers SET name = ?, contactNumber = ?, address = ?, email = ?, supplierCode = ? WHERE id = ?"
    ).run(name, contactNumber, address, email, supplierCode, id);
  },

  deleteSupplier(id) {
    db.prepare("UPDATE suppliers SET deleteStatus = TRUE WHERE id = ?").run(id);
  },
};

module.exports = supplierService;
