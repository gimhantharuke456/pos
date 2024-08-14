const express = require("express");
const cors = require("cors");
const supplierRoutes = require("./routes/supplierRoutes");
const itemRoutes = require("./routes/itemRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const grnRoutes = require("./routes/grnRoutes");
const distributionRoutes = require("./routes/distributionRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reportRoutes = require("./routes/reportRoutes");
const returnRoutes = require("./routes/returnsRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/suppliers", supplierRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/grn", grnRoutes);
app.use("/api/distribution", distributionRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/reports", reportRoutes);
app.use("/api/returns", returnRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
