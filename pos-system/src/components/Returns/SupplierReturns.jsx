// src/components/Returns/SupplierReturns.js
import React, { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { returnService } from "../../services/returnService";
import SupplierReturnForm from "./SupplierReturnForm";

const SupplierReturns = () => {
  const [supplierReturns, setSupplierReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSupplierReturns();
  }, []);

  const fetchSupplierReturns = async () => {
    setLoading(true);
    try {
      const data = await returnService.getSupplierReturns();
      setSupplierReturns(data);
    } catch (error) {
      message.error("Failed to fetch supplier returns");
    }
    setLoading(false);
  };

  const handleCreateReturn = async (values) => {
    try {
      await returnService.createSupplierReturn(
        values.supplierId,
        values.returnItems
      );
      message.success("Supplier return created successfully");
      setShowForm(false);
      fetchSupplierReturns();
    } catch (error) {
      message.error("Failed to create supplier return");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Supplier ID", dataIndex: "supplierId", key: "supplierId" },
    { title: "Return Date", dataIndex: "returnDate", key: "returnDate" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => setShowForm(true)}
        style={{ marginBottom: 16 }}
      >
        Create Supplier Return
      </Button>
      <Table
        columns={columns}
        dataSource={supplierReturns}
        loading={loading}
        rowKey="id"
      />
      {showForm && (
        <SupplierReturnForm
          onSubmit={handleCreateReturn}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default SupplierReturns;
