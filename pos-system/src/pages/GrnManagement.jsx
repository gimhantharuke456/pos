import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
} from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  EyeFilled,
  DeleteFilled,
} from "@ant-design/icons";
import grnService from "../services/grnService";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { purchaseOrderService } from "../services/purchaseOrderService";
import GrnReport from "../components/GrnReport";

const { Option } = Select;

const GrnManagement = () => {
  const [grns, setGrns] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showGrnReportModal, setShowGrnReportModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [poSearchText, setPoSearchText] = useState(""); // New state for purchaseOrderCode search
  const [form] = Form.useForm();
  const [grnCode, setGrnCode] = useState("");

  const generateGrnCode = () => {
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `GRN-${currentDate}-${randomNum}`;
  };

  useEffect(() => {
    fetchGRNs();
    fetchPurchaseOrders();
    setGrnCode(generateGrnCode());
  }, []);

  const fetchGRNs = async () => {
    setLoading(true);
    try {
      const response = await grnService.getAllGRNs();
      setGrns(response.data.reverse());
    } catch (error) {
      message.error("Failed to fetch GRNs");
    }
    setLoading(false);
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await purchaseOrderService.getAllPurchaseOrders();
      setPurchaseOrders(response.data?.filter((po) => po.status === "PENDING"));
    } catch (error) {
      message.error("Failed to fetch Purchase Orders");
    }
  };

  const handlePurchaseOrderSelect = async (value) => {
    try {
      const response = await purchaseOrderService.getPurchaseOrder(value);
      setSelectedPO(response.data);
      form.setFieldsValue({
        purchaseOrderId: response.data.id,
        items: response.data.items.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          orderedQuantity: item.quantity,
          receivedQuantity: item.quantity,
        })),
      });
    } catch (error) {
      message.error("Failed to fetch Purchase Order details");
    }
  };

  const handleCreateGRN = async (values) => {
    try {
      await grnService.createGRN({ ...values, goodReceivedNoteCode: grnCode });
      message.success("GRN created successfully");
      setModalVisible(false);
      form.resetFields();
      fetchGRNs();
    } catch (error) {
      message.error("Failed to create GRN");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await grnService.updateGRNStatus(id, status);
      message.success("GRN status updated successfully");
      fetchGRNs();
    } catch (error) {
      message.error("Failed to update GRN status");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("GRN Report", 14, 15);

    const tableColumn = ["ID", "PO ID", "Receive Date", "Supplier"];
    const tableRows = grns.map((grn) => [
      grn.id,
      grn.purchaseOrderId,
      grn.receiveDate,
      grn.supplierName,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("grn_report.pdf");
  };

  const columns = [
    {
      title: "Invoice Number",
      dataIndex: "goodReceivedNoteCode",
      key: "goodReceivedNoteCode",
      sorter: (a, b) =>
        a.goodReceivedNoteCode.localeCompare(b.goodReceivedNoteCode),
    },
    {
      title: "Purchase Order Code",
      dataIndex: "purchaseOrderCode",
      key: "purchaseOrderCode",
      sorter: (a, b) => a.purchaseOrderId - b.purchaseOrderId,
    },
    {
      title: "Receive Date",
      dataIndex: "receiveDate",
      key: "receiveDate",
      sorter: (a, b) => new Date(a.receiveDate) - new Date(b.receiveDate),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      sorter: (a, b) => a.supplierName.localeCompare(b.supplierName),
    },
    {
      title: "Actions",
      dataIndex: "id",
      key: "ids",
      render: (id) => (
        <>
          <Button
            style={{ marginRight: 8 }}
            onClick={() => {
              setSelectedPO(id);
              setShowGrnReportModal(true);
            }}
            icon={<EyeFilled />}
          ></Button>
          <Button
            style={{ marginRight: 8 }}
            onClick={async () => {
              await grnService.updateGRNStatus(id, "DELETED");
              fetchGRNs();
            }}
            danger
            icon={<DeleteFilled />}
          ></Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>GRN Management</h1>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Create GRN
        </Button>
        <Button icon={<FileTextOutlined />} onClick={generatePDF}>
          Generate Report
        </Button>
      </Space>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by GRN Code"
          onSearch={(value) => setSearchText(value)}
          style={{ width: 200 }}
        />
        <Input.Search
          placeholder="Search by Purchase Order Code"
          onSearch={(value) => setPoSearchText(value)}
          style={{ width: 250 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={grns.filter((grn) => {
          const matchesGrnCode = grn.goodReceivedNoteCode
            ? grn.goodReceivedNoteCode
                .toLowerCase()
                .includes(searchText.toLowerCase())
            : true;
          const matchesPoCode = grn.purchaseOrderCode
            ? grn.purchaseOrderCode
                .toLowerCase()
                .includes(poSearchText.toLowerCase())
            : true;
          return matchesGrnCode && matchesPoCode;
        })}
        loading={loading}
        rowKey="id"
        onChange={(pagination, filters, sorter) => {
          console.log("Table changed:", pagination, filters, sorter);
        }}
      />

      <Modal
        width={1200}
        title="Create GRN"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateGRN} layout="vertical">
          <Form.Item name="goodReceivedNoteCode" label="Invoice Number">
            <Input />
          </Form.Item>
          <Form.Item
            name="purchaseOrderId"
            label="Purchase Order"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select Purchase Order"
              onChange={handlePurchaseOrderSelect}
            >
              {purchaseOrders.map((po) => (
                <Option key={po.id} value={po.id}>
                  {`${po.purchaseOrderCode} - ${po.supplierName} - ${po.orderDate}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="receiveDate"
            label="Receive Date"
            rules={[{ required: true }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item name="items" label="Items">
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item {...restField} name={[name, "itemId"]} hidden>
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "itemName"]}
                        label="Item"
                      >
                        <Input disabled />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "orderedQuantity"]}
                        label="Ordered Qty"
                      >
                        <Input disabled />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "receivedQuantity"]}
                        label="Received Qty"
                      >
                        <Input type="number" min={1} />
                      </Form.Item>
                      <Button onClick={() => remove(name)}>Delete</Button>
                    </Space>
                  ))}
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select defaultValue="PENDING">
              <Option value="PENDING">Pending</Option>
              <Option value="COMPLETED">Completed</Option>
            </Select>
          </Form.Item>
          <Form.Item name="supplierName" label="Supplier">
            <Input disabled value={selectedPO?.supplierName} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create GRN
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        width={1000}
        title="GRN Report"
        open={showGrnReportModal}
        onCancel={() => setShowGrnReportModal(false)}
        footer={null}
      >
        <GrnReport grnId={selectedPO} />
      </Modal>
    </div>
  );
};

export default GrnManagement;
