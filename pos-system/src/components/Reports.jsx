import React, { useState, useEffect } from "react";
import { Form, Select, DatePicker, Button, Table, message } from "antd";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import reportService from "../services/reportService";
import supplierService from "../services/supplierService";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Reports = () => {
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAllSuppliers();
      setSuppliers(data);
    } catch (error) {
      message.error("Failed to fetch suppliers");
    }
  };

  const columns = [
    { title: "Item Name", dataIndex: "itemName", key: "itemName" },
    { title: "Item Code", dataIndex: "itemCode", key: "itemCode" },
    { title: "Unit Type", dataIndex: "unitType", key: "unitType" },
    { title: "Supplier", dataIndex: "supplierName", key: "supplierName" },
    { title: "In Stock", dataIndex: "inStockAmount", key: "inStockAmount" },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { supplier, dateRange } = values;
      const [fromDate, toDate] = dateRange || [];
      const data = await reportService.getStockReport(
        supplier,
        fromDate?.format("YYYY-MM-DD"),
        toDate?.format("YYYY-MM-DD")
      );
      setStockData(data);
    } catch (error) {
      message.error("Failed to fetch stock report");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Stock Report", 14, 15);
    doc.autoTable({
      head: columns.map((col) => col.title),
      body: stockData.map((item) => columns.map((col) => item[col.dataIndex])),
      startY: 20,
    });
    doc.save("stock_report.pdf");
  };

  const chartData = {
    labels: stockData.map((item) => item.itemName),
    datasets: [
      {
        label: "In Stock Amount",
        data: stockData.map((item) => item.inStockAmount),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div>
      <h1>Stock Report</h1>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="inline"
        style={{ marginBottom: 20 }}
      >
        <Form.Item name="supplier">
          <Select style={{ width: 200 }} placeholder="Select Supplier">
            <Option value="">All Suppliers</Option>
            {suppliers.map((supplier) => (
              <Option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="dateRange">
          <RangePicker />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Generate Report
          </Button>
        </Form.Item>
      </Form>

      <Table columns={columns} dataSource={stockData} loading={loading} />

      {stockData.length > 0 && (
        <>
          <Button onClick={generatePDF} style={{ marginTop: 20 }}>
            Download PDF
          </Button>
          <div style={{ marginTop: 20, width: "100%", height: 300 }}>
            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
