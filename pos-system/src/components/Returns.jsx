import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Input,
  Select,
  Button,
  Modal,
  message,
  Spin,
  DatePicker,
  Card,
  Row,
  Col,
} from "antd";
import { PlusOutlined, FilePdfOutlined } from "@ant-design/icons";
import returnsAxiosService from "../services/returnsAxiosService";
import orderService from "../services/orderService";
import supplierService from "../services/supplierService";
import { getAllItems } from "../services/itemService";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [returnCounts, setReturnCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [reportFilter, setReportFilter] = useState({
    supplierId: null,
    dateRange: null,
  });

  useEffect(() => {
    fetchReturns();
    fetchReturnCounts();
    fetchSuppliers();
    fetchOrders();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await returnsAxiosService.getReturns();
      setReturns(response.data);
    } catch (error) {
      message.error("Error fetching returns");
    }
    setLoading(false);
  };

  const fetchReturnCounts = async () => {
    try {
      const response = await returnsAxiosService.getReturnCountByItem();
      setReturnCounts(response.data);
    } catch (error) {
      message.error("Error fetching return counts");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAllSuppliers();
      setSuppliers(response);
    } catch (error) {
      message.error("Error fetching suppliers");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await orderService.getAllOrders();
      setOrders(response);
    } catch (error) {
      message.error("Error fetching orders");
    }
  };

  const handleOrderSelect = async (orderId) => {
    try {
      const order = await orderService.getOrderById(orderId);

      const items = await getAllItems();
      const orderItems = order.items.map((orderItem) => {
        const item = items.find((i) => i.id === orderItem.itemId);
        return {
          ...orderItem,
          itemName: item ? item.itemName : "Unknown Item",
          returned: false,
          returnStatus: "reusable",
        };
      });
      setSelectedOrderItems(orderItems);
    } catch (error) {
      message.error("Error fetching order details " + error);
    }
  };

  const handleCreate = async (values) => {
    try {
      const returnsToCreate = selectedOrderItems
        .filter((item) => item.returned)
        .map((item) => ({
          orderId: values.orderId,
          itemId: item.itemId,
          quantity: item.quantity,
          reason: values.reason,
          status: item.returnStatus,
        }));

      for (let returnItem of returnsToCreate) {
        await returnsAxiosService.createReturn(returnItem);
      }

      message.success("Returns created successfully");
      setModalVisible(false);
      fetchReturns();
      fetchReturnCounts();
    } catch (error) {
      message.error("Error creating returns");
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const response = await returnsAxiosService.getFilteredReturns(
        reportFilter
      );
      generatePDF(response.data);
      message.success("Report generated successfully");
    } catch (error) {
      message.error("Error generating report");
    }
    setLoading(false);
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    doc.text("Returns Report", 14, 15);

    const tableColumn = [
      "ID",
      "Order ID",
      "Item Name",
      "Quantity",
      "Reason",
      "Status",
      "Date",
    ];
    const tableRows = data.map((item) => [
      item.id,
      item.orderId,
      item.itemName,
      item.quantity,
      item.reason,
      item.status,
      new Date(item.createdAt).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Returns_Report.pdf");
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Order ID", dataIndex: "orderId", key: "orderId" },
    { title: "Item Name", dataIndex: "itemName", key: "itemName" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Reason", dataIndex: "reason", key: "reason" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
  ];

  const countColumns = [
    { title: "Item Name", dataIndex: "itemName", key: "itemName" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Count", dataIndex: "count", key: "count" },
    {
      title: "Total Quantity",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
    },
  ];

  return (
    <Spin spinning={loading}>
      <div className="returns-container">
        <h1>Returns Management</h1>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          style={{ marginBottom: 16 }}
        >
          New Return
        </Button>

        <Card title="Generate Report" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Select
                style={{ width: "100%" }}
                placeholder="Select Supplier"
                onChange={(value) =>
                  setReportFilter({ ...reportFilter, supplierId: value })
                }
              >
                {suppliers.map((supplier) => (
                  <Option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <RangePicker
                style={{ width: "100%" }}
                onChange={(dates) =>
                  setReportFilter({ ...reportFilter, dateRange: dates })
                }
              />
            </Col>
            <Col span={8}>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={handleGenerateReport}
                style={{ width: "100%" }}
              >
                Generate Report
              </Button>
            </Col>
          </Row>
        </Card>

        <Table
          dataSource={returns}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <h2>Return Counts by Item</h2>
        <Table
          dataSource={returnCounts}
          columns={countColumns}
          rowKey={(record) => `${record.itemName}-${record.status}`}
          pagination={false}
        />

        <Modal
          title="Create New Return"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form form={form} onFinish={handleCreate} layout="vertical">
            <Form.Item
              name="orderId"
              label="Order"
              rules={[{ required: true, message: "Please select an order" }]}
            >
              <Select
                placeholder="Select an order"
                onChange={handleOrderSelect}
              >
                {orders.map((order) => (
                  <Option key={order.id} value={order.id}>
                    Order {order.id} -{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="reason"
              label="Reason for Return"
              rules={[
                {
                  required: true,
                  message: "Please provide a reason for return",
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>

            <Table
              dataSource={selectedOrderItems}
              rowKey="itemId"
              pagination={false}
              columns={[
                { title: "Item Name", dataIndex: "itemName", key: "itemName" },
                { title: "Quantity", dataIndex: "quantity", key: "quantity" },
                {
                  title: "Return",
                  key: "returned",
                  render: (_, record) => (
                    <Select
                      value={record.returned ? "yes" : "no"}
                      onChange={(value) => {
                        const newItems = selectedOrderItems.map((item) =>
                          item.itemId === record.itemId
                            ? { ...item, returned: value === "yes" }
                            : item
                        );
                        setSelectedOrderItems(newItems);
                      }}
                    >
                      <Option value="yes">Yes</Option>
                      <Option value="no">No</Option>
                    </Select>
                  ),
                },
                {
                  title: "Return Status",
                  key: "returnStatus",
                  render: (_, record) => (
                    <Select
                      value={record.returnStatus}
                      onChange={(value) => {
                        const newItems = selectedOrderItems.map((item) =>
                          item.itemId === record.itemId
                            ? { ...item, returnStatus: value }
                            : item
                        );
                        setSelectedOrderItems(newItems);
                      }}
                      disabled={!record.returned}
                    >
                      <Option value="reusable">Reusable</Option>
                      <Option value="non-reusable">Non-reusable</Option>
                    </Select>
                  ),
                },
              ]}
            />

            <Form.Item style={{ marginTop: 16 }}>
              <Button type="primary" htmlType="submit">
                Create Returns
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};

export default Returns;
