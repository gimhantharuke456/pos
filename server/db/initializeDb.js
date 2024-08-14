const Database = require("better-sqlite3");
const path = require("path");

let db;

const initializeDb = () => {
  if (db) return db;

  const dbPath = path.join(__dirname, "wholesaleSystem.sqlite");
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      supplierCode TEXT UNIQUE,
      contactNumber TEXT,
      deleteStatus BOOLEAN DEFAULT FALSE,
      address TEXT,
      email TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemName TEXT,
      itemCode TEXT UNIQUE,
      unitType TEXT,
      unitPrice REAL,
      discountPercentage1 REAL,
      discountPercentage2 REAL,
      deleteStatus BOOLEAN DEFAULT FALSE,
      supplierId INTEGER,
      wholesalePrice REAL,
      secondPrice REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplierId) REFERENCES suppliers(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS purchaseOrders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderDate TEXT,
      purchaseOrderCode TEXT UNIQUE,
      status TEXT DEFAULT 'Pending',
      supplierId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplierId) REFERENCES suppliers(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS purchaseOrderItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchaseOrderId INTEGER,
      itemId INTEGER,
      quantity INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (purchaseOrderId) REFERENCES purchaseOrders(id),
      FOREIGN KEY (itemId) REFERENCES items(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS goodsReceivedNotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchaseOrderId INTEGER UNIQUE,
      goodReceivedNoteCode TEXT,
      receiveDate TEXT,
      status TEXT DEFAULT 'PENDING',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (purchaseOrderId) REFERENCES purchaseOrders(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS goodsReceivedItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goodsReceivedNoteId INTEGER,
      itemId INTEGER,
      orderedQuantity INTEGER,
      receivedQuantity INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goodsReceivedNoteId) REFERENCES goodsReceivedNotes(id),
      FOREIGN KEY (itemId) REFERENCES items(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS distributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemId INTEGER,
      inStockAmount INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (itemId) REFERENCES items(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerCode TEXT UNIQUE,
      name TEXT NOT NULL,
      contactNumber TEXT,
      address TEXT NOT NULL,
      email TEXT,
      deleteStatus BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      paymentMethod TEXT CHECK(paymentMethod IN ('cash', 'cheque', 'credit')) NOT NULL,
      totalAmount REAL NOT NULL,
      discount REAL DEFAULT 0,
      deleteStatus BOOLEAN DEFAULT FALSE,
      paymentStatus TEXT CHECK(paymentStatus IN ('pending', 'accepted', 'partially paid')) NOT NULL DEFAULT 'pending',
      paidAmount REAL DEFAULT 0,
      outstandingAmount REAL GENERATED ALWAYS AS (totalAmount - paidAmount - discount) VIRTUAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES customers(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orderItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      itemId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      itemPrice REAL NOT NULL,
      discount1 REAL DEFAULT 0,
      discount2 REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (itemId) REFERENCES items(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      itemId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT,
      status TEXT CHECK(status IN ('reusable', 'non-reusable')) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (itemId) REFERENCES items(id)
    )
  `);

  console.log("Database initialized");
  return db;
};

module.exports = initializeDb;
