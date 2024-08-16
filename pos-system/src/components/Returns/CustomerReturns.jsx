// src/components/Returns/CustomerReturns.js
import React, { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { returnService } from "../../services/returnService";
import CustomerReturnForm from "./CustomerReturnForm";

const CustomerReturns = () => {
  const [customerReturns, setCustomerReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCustomerReturns();
  }, []);

  const fetchCustomerReturns = async () => {
    setLoading(true);
    try {
      const data = await returnService.getCustomerReturns();
      setCustomerReturns(data);
    } catch (error) {
      message.error("Failed to fetch customer returns");
    }
    setLoading(false);
  };

  const handleCreateReturn = async (values) => {
    try {
      await returnService.createCustomerReturn(
        values.orderId,
        values.returnItems
      );
      message.success("Customer return created successfully");
      setShowForm(false);
      fetchCustomerReturns();
    } catch (error) {
      message.error("Failed to create customer return");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Order ID", dataIndex: "orderId", key: "orderId" },
    { title: "Return Date", dataIndex: "returnDate", key: "returnDate" },
    { title: "Total Amount", dataIndex: "totalAmount", key: "totalAmount" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => setShowForm(true)}
        style={{ marginBottom: 16 }}
      >
        Create Customer Return
      </Button>
      <Table
        columns={columns}
        dataSource={customerReturns}
        loading={loading}
        rowKey="id"
      />
      {showForm && (
        <CustomerReturnForm
          onSubmit={handleCreateReturn}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default CustomerReturns;
