// src/components/Returns/NonSalableItems.js
import React, { useState, useEffect } from "react";
import { Table, message } from "antd";
import { returnService } from "../../services/returnService";

const NonSalableItems = () => {
  const [nonSalableItems, setNonSalableItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNonSalableItems();
  }, []);

  const fetchNonSalableItems = async () => {
    setLoading(true);
    try {
      const data = await returnService.getNonSalableItems();
      setNonSalableItems(data);
    } catch (error) {
      message.error("Failed to fetch non-salable items");
    }
    setLoading(false);
  };

  const columns = [
    { title: "Item ID", dataIndex: "id", key: "id" },
    { title: "Item Name", dataIndex: "itemName", key: "itemName" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Reason", dataIndex: "reason", key: "reason" },
  ];

  return (
    <div>
      <h2>Non-Salable Items</h2>
      <Table
        columns={columns}
        dataSource={nonSalableItems}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default NonSalableItems;
