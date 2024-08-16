import React, { useState, useEffect } from "react";
import {
  Form,
  Select,
  Button,
  message,
  Table,
  Input,
  InputNumber,
  DatePicker,
  Spin,
} from "antd";
import customerService from "../services/customerService";
import { getAllItems } from "../services/itemService";
import supplierService from "../services/supplierService";

const { Option } = Select;

const OrderForm = ({ onSubmit, initialValues }) => {
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
    fetchSuppliers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data.data);
    } catch (error) {
      message.error("Failed to fetch customers");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAllSuppliers();
      setSuppliers(data);
    } catch (error) {
      message.error("Failed to fetch suppliers");
    }
  };

  const fetchItemsBySupplier = async (supplierId) => {
    setLoading(true);
    try {
      const data = await getAllItems(supplierId);
      setItems(
        data.map((item) => ({
          ...item,
          quantity: 0,
          discount1: 0,
          discount2: 0,
        }))
      );
    } catch (error) {
      message.error("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const orderedItems = items.filter((item) => item.quantity > 0);
      const total = orderedItems.reduce((sum, item) => {
        const { unitPrice, quantity, discount1, discount2 } = item;
        const itemTotal =
          unitPrice * quantity -
          (unitPrice * discount1 * quantity) / 100 -
          (unitPrice * discount2 * quantity) / 100;
        return sum + itemTotal;
      }, 0);
      await onSubmit({ ...values, items: orderedItems, totalAmount: total });
      message.success("Order submitted successfully");
      form.resetFields();
      setItems(
        items.map((item) => ({
          ...item,
          quantity: 0,
          discount1: 0,
          discount2: 0,
        }))
      );
    } catch (error) {
      message.error("Failed to submit order " + error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuantityChange = (itemId, value) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, quantity: value } : item
      )
    );
  };

  const handleDiscountChange = (itemId, discountType, value) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, [discountType]: value } : item
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
      title: "Selling Price",
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
      title: "Discount 1 (%)",
      dataIndex: "discount1",
      key: "discount1",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discount1}
          onChange={(value) =>
            handleDiscountChange(record.id, "discount1", value)
          }
        />
      ),
    },
    {
      title: "Discount 2 (%)",
      dataIndex: "discount2",
      key: "discount2",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discount2}
          onChange={(value) =>
            handleDiscountChange(record.id, "discount2", value)
          }
        />
      ),
    },
    {
      title: "Total Price",
      key: "totalPrice",
      render: (_, record) => (
        <>
          {(
            record.unitPrice *
            record.quantity *
            (1 - record.discount1 / 100) *
            (1 - record.discount2 / 100)
          ).toFixed(2)}
        </>
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
        rules={[{ required: true }]}
        name="orderDate"
        label="Order Date"
      >
        <DatePicker
          placeholder="Select Order Date"
          format="YYYY-MM-DD"
          style={{ width: "100%" }}
        />
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
        name="supplierId"
        label="Supplier"
        rules={[{ required: true }]}
      >
        <Select placeholder="Select a supplier" onChange={fetchItemsBySupplier}>
          {suppliers.map((supplier) => (
            <Option key={supplier.id} value={supplier.id}>
              {supplier.name}
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

      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={items}
          rowKey={(record) => record.id}
          pagination={false}
          style={{ marginBottom: 20 }}
        />
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          {initialValues ? "Update Order" : "Create Order"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OrderForm;
