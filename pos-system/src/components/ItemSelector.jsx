import React, { useState, useEffect } from "react";
import { Form, Select, Button, message, Table, Input, InputNumber } from "antd";
import customerService from "../services/customerService";
import { getAllItems } from "../services/itemService";

const { Option } = Select;

const OrderForm = ({ onSubmit, initialValues }) => {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
    fetchItems();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data.data);
    } catch (error) {
      message.error("Failed to fetch customers");
    }
  };

  const fetchItems = async () => {
    try {
      const data = await getAllItems();
      setItems(data.map((item) => ({ ...item, quantity: 0, discount: 0 })));
    } catch (error) {
      message.error("Failed to fetch items");
    }
  };

  const handleSubmit = (values) => {
    const orderedItems = items.filter((item) => item.quantity > 0);
    onSubmit({ ...values, items: orderedItems });

    // Clean all inputs after creating order
    form.resetFields();
    setItems(items.map((item) => ({ ...item, quantity: 0, discount: 0 })));
  };

  const handleQuantityChange = (itemId, value) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, quantity: value } : item
      )
    );
  };

  const handleDiscountChange = (itemId, value) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, discount: value } : item
      )
    );
  };

  const columns = [
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
        />
      ),
    },
    {
      title: "Discount (%)",
      dataIndex: "discount",
      key: "discount",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discount}
          onChange={(value) => handleDiscountChange(record.id, value)}
        />
      ),
    },
    {
      title: "Total Price",
      key: "totalPrice",
      render: (_, record) => (
        <>{record.unitPrice * record.quantity * (1 - record.discount / 100)}</>
      ),
    },
  ];

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      initialValues={initialValues}
      layout="vertical"
    >
      <Form.Item
        rules={[{ required: true }]}
        name="orderCode"
        label="Order Code"
      >
        <Input placeholder="Order Code" />
      </Form.Item>
      <Form.Item
        name="customerId"
        label="Customer"
        rules={[{ required: true }]}
      >
        <Select placeholder="Select a customer">
          {customers.map((customer) => (
            <Option key={customer.id} value={customer.id}>
              {customer.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="paymentMethod"
        label="Payment Method"
        rules={[{ required: true }]}
      >
        <Select placeholder="Select a payment method">
          <Option value="cash">Cash</Option>
          <Option value="cheque">Cheque</Option>
          <Option value="credit">Credit</Option>
        </Select>
      </Form.Item>

      <Table
        columns={columns}
        dataSource={items}
        rowKey={(record) => record.id}
        pagination={false}
        style={{ marginBottom: 20 }}
      />

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {initialValues ? "Update Order" : "Create Order"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OrderForm;
