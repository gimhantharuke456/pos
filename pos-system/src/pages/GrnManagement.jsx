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
  DeleteFilled,
  EyeFilled,
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
  const [form] = Form.useForm();

  useEffect(() => {
    fetchGRNs();
    fetchPurchaseOrders();
  }, []);

  const fetchGRNs = async () => {
    setLoading(true);
    try {
      const response = await grnService.getAllGRNs();
      setGrns(response.data);
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
      await grnService.createGRN(values);
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
    { title: "GRN ID", dataIndex: "id", key: "id" },
    {
      title: "Purchase Order ID",
      dataIndex: "purchaseOrderId",
      key: "purchaseOrderId",
    },
    { title: "Receive Date", dataIndex: "receiveDate", key: "receiveDate" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Supplier", dataIndex: "supplierName", key: "supplierName" },
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
          {/* <Button
            onClick={() => {
              handleUpdateStatus(id, "DELETED");
            }}
            danger
            icon={<DeleteFilled />}
          ></Button> */}
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
      <Table
        columns={columns}
        dataSource={grns}
        loading={loading}
        rowKey="id"
      />

      <Modal
        width={1200}
        title="Create GRN"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateGRN} layout="vertical">
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
                        label="Item Name"
                      >
                        <Input disabled />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "orderedQuantity"]}
                        label="Ordered Quantity"
                      >
                        <Input disabled />
                      </Form.Item>
                      <Form.Item
                        label="Recieved Quantity"
                        {...restField}
                        name={[name, "receivedQuantity"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing received quantity",
                          },
                        ]}
                      >
                        <Input placeholder="Received Quantity" type="number" />
                      </Form.Item>
                    </Space>
                  ))}
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create GRN
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {selectedPO && (
        <Modal
          width={1200}
          title="GRN Report"
          open={showGrnReportModal}
          onCancel={() => setShowGrnReportModal(false)}
          footer={null}
        >
          <GrnReport
            grnId={selectedPO}
            refresh={() => {
              setShowGrnReportModal(false);
              fetchGRNs();
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default GrnManagement;
