import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  message,
  Popconfirm,
  Input,
  Row,
  Col,
} from "antd";
import { purchaseOrderService } from "../services/purchaseOrderService";
import PurchaseOrderForm from "./PurchaseOrderForm";
import { EyeFilled, DeleteFilled } from "@ant-design/icons";
import PurchaseOrderReport from "./PurchaseOrderReport";

const PurchaseOrderList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [isViewOrder, setIsViewOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, purchaseOrders]);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await purchaseOrderService.getAllPurchaseOrders();
      setPurchaseOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      message.error("Failed to fetch purchase orders");
    }
  };

  const handleSearch = () => {
    const filtered = purchaseOrders.filter((order) =>
      order.purchaseOrderCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const handleCreate = () => {
    setSelectedPO(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedPO(record);
    setIsViewOrder(true);
  };

  const handleDelete = async (id) => {
    try {
      await purchaseOrderService.deletePurchaseOrder(id);
      message.success("Purchase order deleted successfully");
      fetchPurchaseOrders();
    } catch (error) {
      message.error("Failed to delete purchase order");
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setIsViewOrder(false);
    setSelectedPO(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (selectedPO) {
        await purchaseOrderService.updatePurchaseOrder(selectedPO.id, values);
        message.success("Purchase order updated successfully");
      } else {
        await purchaseOrderService.createPurchaseOrder(values);
        message.success("Purchase order created successfully");
      }
      handleModalClose();
      fetchPurchaseOrders();
    } catch (error) {
      message.error("Failed to save purchase order");
    }
  };

  const columns = [
    {
      title: "Order Code",
      dataIndex: "purchaseOrderCode",
      key: "id",
      sorter: (a, b) => a.purchaseOrderCode.localeCompare(b.purchaseOrderCode),
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
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
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            style={{ marginRight: 8 }}
            icon={<EyeFilled />}
            onClick={() => handleEdit(record)}
          >
            View Order
          </Button>

          <Popconfirm
            title="Are you sure you want to delete this purchase order?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteFilled />}></Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Search by order code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col span={16}>
          <Button onClick={handleCreate} type="primary">
            Create Purchase Order
          </Button>
        </Col>
      </Row>
      <Table columns={columns} dataSource={filteredOrders} rowKey="id" />
      <Modal
        width={1200}
        title={selectedPO ? "Edit Purchase Order" : "Create Purchase Order"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <PurchaseOrderForm
          initialValues={selectedPO}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>
      <Modal
        width={1200}
        title={""}
        open={isViewOrder}
        onCancel={handleModalClose}
        footer={null}
      >
        <PurchaseOrderReport purchaseOrderId={selectedPO?.id} />
      </Modal>
    </div>
  );
};

export default PurchaseOrderList;
