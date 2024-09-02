import React, { useEffect, useState } from "react";
import {
  Table,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Space,
  message,
  Modal,
} from "antd";
import stockUpdateService from "../services/stockUpdateService";
import moment from "moment";
import { getAllItems } from "../services/itemService";
import jsPDF from "jspdf";

const { RangePicker } = DatePicker;
const { Option } = Select;

const StockReport = () => {
  const [stockUpdates, setStockUpdates] = useState([]);
  const [filteredUpdates, setFilteredUpdates] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]); // For the item dropdown
  const [totalQuantity, setTotalQuantity] = useState(0); // To hold the total quantity
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility

  useEffect(() => {
    // Fetch all stock updates
    const fetchStockUpdates = async () => {
      try {
        const data = await stockUpdateService.getAllStockUpdates();
        setStockUpdates(data);
        setFilteredUpdates(data); // Initially, filtered data is the same as all data
      } catch (error) {
        message.error("Failed to fetch stock updates.");
      }
    };

    // Fetch items for item selection
    const fetchItems = async () => {
      try {
        const response = await getAllItems();
        setItems([{ id: null, itemName: "All Items" }, ...response]); // Add "All Items" option
      } catch (error) {
        message.error("Failed to fetch items.");
      }
    };

    fetchStockUpdates();
    fetchItems();
  }, []);

  const handleFilter = () => {
    let filtered = stockUpdates;
    let total = 0;

    // Filter by date range
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter((update) => {
        const updateDate = moment(update.updateDate);
        return updateDate.isBetween(startDate, endDate, "days", "[]");
      });
    }

    // Filter by item
    if (selectedItem !== null) {
      filtered = filtered.filter((update) => update.itemId === selectedItem);
    }

    // Calculate total quantity
    total = filtered.reduce((sum, update) => sum + update.updatedQuantity, 0);

    setFilteredUpdates(filtered);
    setTotalQuantity(total);
    setIsModalVisible(true); // Show the modal
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Stock Report", 10, 10);
    doc.text(`Total Quantity: ${totalQuantity}`, 10, 20);
    doc.save("stock_report.pdf");
  };

  const columns = [
    {
      title: "Item",
      dataIndex: "itemName",
      key: "item",
      render: (text, record) => `${record.itemName} (${record.itemCode})`,
    },
    {
      title: "Updated Quantity",
      dataIndex: "updatedQuantity",
      key: "updatedQuantity",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Update Date",
      dataIndex: "updateDate",
      key: "updateDate",
      render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Space direction="vertical">
            <RangePicker onChange={setDateRange} />
          </Space>
        </Col>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="Select Item"
            onChange={setSelectedItem}
          >
            {items.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.itemName}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Button type="primary" onClick={handleFilter}>
            Filter
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredUpdates}
        rowKey={(record) => record.id}
      />

      {/* Modal for showing the total quantity */}
      <Modal
        title="Stock Report"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="download" type="primary" onClick={generatePDF}>
            Download PDF
          </Button>,
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <p>Total Quantity: {totalQuantity}</p>
      </Modal>
    </div>
  );
};

export default StockReport;
