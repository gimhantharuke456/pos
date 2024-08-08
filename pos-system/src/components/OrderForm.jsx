import React, { useState, useEffect } from "react";
import { Form, Select, Button, message, Table } from "antd";
import customerService from "../services/customerService";
import ItemSelector from "./ItemSelector";
import { DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const OrderForm = ({ onSubmit, initialValues }) => {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState(initialValues?.items || []);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await customerService.getAllCustomers();
        setCustomers(data.data);
      } catch (error) {
        message.error("Failed to fetch customers");
      }
    };
    fetchCustomers();
  }, []);

  const handleAddItem = (item) => {
    const existingItemIndex = items.findIndex(
      (i) => i.id === item.id && i.discount === item.discount
    );

    if (existingItemIndex >= 0) {
      // Item already exists, update the quantity
      const updatedItems = items.slice();
      updatedItems[existingItemIndex].quantity += item.quantity;
      setItems(updatedItems);
    } else {
      // Item does not exist, add it
      setItems([...items, item]);
    }
  };

  const handleSubmit = (values) => {
    onSubmit({ ...values, items });
  };

  const columns = [
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Discount (%)",
      dataIndex: "discount",
      key: "discount",
    },
    {
      title: "Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (text, record) => (
        <>{record.unitPrice * record.quantity * (1 - record.discount / 100)}</>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record, index) => (
        <Button
          icon={<DeleteOutlined />}
          type="link"
          onClick={() => handleRemoveItem(index)}
          danger
        ></Button>
      ),
    },
  ];

  const handleRemoveItem = (index) => {
    const newItems = items.slice();
    newItems.splice(index, 1);
    setItems(newItems);
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      initialValues={initialValues}
      layout="vertical"
    >
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

      {/* Item Selector to Add Items */}
      <ItemSelector items={items} onAddItem={handleAddItem} />

      {/* Table to Show Added Items */}
      <Table
        columns={columns}
        dataSource={items}
        rowKey={(record) => record.id}
        pagination={false}
        style={{ marginBottom: 20 }}
      />

      {/* Submit Button */}
      <Button type="primary" htmlType="submit">
        {initialValues ? "Update Order" : "Create Order"}
      </Button>
    </Form>
  );
};

export default OrderForm;
