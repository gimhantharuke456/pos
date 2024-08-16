import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  message,
  Select,
  InputNumber,
  Row,
  Input,
} from "antd";
import orderService from "../services/orderService";
import {
  DeleteOutlined,
  EyeFilled,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import moment from "moment";
import OrderForm from "../components/ItemSelector";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [viewOrderItems, setViewOrderItems] = useState(null);
  const [updatePaidAmountModalVisible, setUpdatePaidAmountModalVisible] =
    useState(false);
  const [selectedOrderForPaidAmount, setSelectedOrderForPaidAmount] =
    useState(null);
  const [newPaidAmount, setNewPaidAmount] = useState(0);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getAllOrders();
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        message.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = orders.filter((order) =>
      order.customerCode.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const handleCreateOrder = () => {
    setCurrentOrder(null);
    setIsModalVisible(true);
  };

  const handleDeleteOrder = async (id) => {
    try {
      await orderService.deleteOrder(id);
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
      setFilteredOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== id)
      );
      message.success("Order deleted successfully");
    } catch (error) {
      message.error("Failed to delete order");
    }
  };

  const handleSubmitOrder = async (order) => {
    try {
      if (currentOrder) {
        await orderService.updateOrder(currentOrder.id, order);
        const updatedOrders = orders.map((o) =>
          o.id === currentOrder.id ? order : o
        );
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        message.success("Order updated successfully");
      } else {
        await orderService.createOrder(order);
        const data = await orderService.getAllOrders();
        setOrders(data);
        setFilteredOrders(data);
        message.success("Order created successfully");
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to submit order");
    }
  };

  const showOrderItemsModal = (order) => {
    setViewOrderItems(order.items);
  };

  const showUpdatePaidAmountModal = (order) => {
    setSelectedOrderForPaidAmount(order);
    setNewPaidAmount(0);
    setUpdatePaidAmountModalVisible(true);
  };

  const handleUpdatePaidAmount = async () => {
    if (selectedOrderForPaidAmount) {
      try {
        await orderService.updatePaidAmount(
          selectedOrderForPaidAmount.id,
          newPaidAmount
        );
        const updatedOrders = orders.map((order) =>
          order.id === selectedOrderForPaidAmount.id
            ? {
                ...order,
                paidAmount: order.paidAmount + newPaidAmount,
                outstandingAmount: order.outstandingAmount - newPaidAmount,
              }
            : order
        );
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        setUpdatePaidAmountModalVisible(false);
        message.success("Paid amount updated successfully");
      } catch (error) {
        message.error("Failed to update paid amount");
      }
    }
  };

  const handleUpdatePaymentStatus = async (orderId, status) => {
    try {
      await orderService.updatePaymentStatus(orderId, status);
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, paymentStatus: status } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      message.success("Payment status updated successfully");
    } catch (error) {
      message.error("Failed to update payment status");
    }
  };

  const columns = [
    {
      title: "Invoice Number",
      dataIndex: "orderCode",
      key: "orderCode",
    },
    {
      title: "Customer Code",
      dataIndex: "customerCode",
      key: "customerName",
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
    },
    {
      title: "Paid Amount",
      dataIndex: "paidAmount",
      key: "paidAmount",
    },
    {
      title: "Outstanding Amount",
      dataIndex: "outstandingAmount",
      key: "outstandingAmount",
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => handleUpdatePaymentStatus(record.id, value)}
        >
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="accepted">Accepted</Select.Option>
          <Select.Option value="partially paid">Partially Paid</Select.Option>
        </Select>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Row>
          <Button
            onClick={() => showOrderItemsModal(record)}
            style={{ marginRight: 10 }}
            icon={<EyeFilled />}
          />
          <Button
            onClick={() => showUpdatePaidAmountModal(record)}
            style={{ marginRight: 10 }}
            icon={<MoneyCollectOutlined />}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteOrder(record.id)}
          />
        </Row>
      ),
    },
  ];

  const totalBill = () => {
    if (viewOrderItems != null) {
      return viewOrderItems.reduce((total, item) => {
        return total + item.quantity * item.itemPrice;
      }, 0);
    }
    return 0;
  };

  return (
    <div>
      <Input.Search
        placeholder="Search by Customer Code"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        onSearch={handleSearch}
        style={{ width: 300, marginBottom: 20 }}
      />
      <Button type="primary" onClick={handleCreateOrder}>
        Create Order
      </Button>
      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={loading}
        style={{ marginTop: 20 }}
      />
      <Modal
        width={800}
        title={currentOrder ? "Edit Order" : "Create Order"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <OrderForm onSubmit={handleSubmitOrder} initialValues={currentOrder} />
      </Modal>
      <Modal
        width={400}
        title="Update Paid Amount"
        open={updatePaidAmountModalVisible}
        onCancel={() => setUpdatePaidAmountModalVisible(false)}
        onOk={handleUpdatePaidAmount}
      >
        <InputNumber
          min={0}
          value={newPaidAmount}
          onChange={(value) => setNewPaidAmount(value)}
          style={{ width: "100%" }}
        />
      </Modal>
      <Modal
        width={1200}
        title="Invoice Items"
        open={viewOrderItems !== null}
        onCancel={() => setViewOrderItems(null)}
        footer={null}
      >
        <Table
          columns={[
            {
              title: "Item Code",
              dataIndex: "itemCode",
              key: "itemCode",
            },
            {
              title: "Quantity",
              dataIndex: "quantity",
              key: "quantity",
            },
            {
              title: "Item Price",
              dataIndex: "itemPrice",
              key: "itemPrice",
            },

            {
              title: "Total Price",
              dataIndex: "itemPrice",
              key: "totalPrice",
              render: (text, record) => (
                <>{record.itemPrice * record.quantity}</>
              ),
            },
          ]}
          dataSource={viewOrderItems}
          rowKey="id"
          pagination={false}
        />
        <Row justify="end" style={{ marginTop: 20 }}>
          <h1> {`Total Bill LKR : ${totalBill().toString()}`}</h1>
        </Row>
      </Modal>
    </div>
  );
};

export default Orders;
