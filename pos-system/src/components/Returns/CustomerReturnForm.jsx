// src/components/Returns/CustomerReturnForm.js
import React, { useState, useEffect } from "react";
import {
  Form,
  Select,
  Button,
  InputNumber,
  Switch,
  Space,
  message,
} from "antd";
import PropTypes from "prop-types";
import orderService from "../../services/orderService";
import { getAllItems } from "../../services/itemService";

const { Option } = Select;

const CustomerReturnForm = ({ onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchAllItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersData = await orderService.getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      message.error("Failed to fetch orders");
    }
  };

  const fetchAllItems = async () => {
    try {
      const itemsData = await getAllItems();
      setAllItems(itemsData);
    } catch (error) {
      message.error("Failed to fetch items");
    }
  };

  const handleOrderChange = async (orderId) => {
    try {
      const orderDetails = await orderService.getOrderById(orderId);
      setSelectedOrderItems(orderDetails.items || []);
      form.setFieldsValue({ returnItems: [] });
    } catch (error) {
      message.error("Failed to fetch order details");
    }
  };

  const onFinish = (values) => {
    onSubmit(values);
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="orderId"
        label="Order ID"
        rules={[{ required: true, message: "Please select an Order ID!" }]}
      >
        <Select
          placeholder="Select Order ID"
          onChange={handleOrderChange}
          loading={orders.length === 0}
        >
          {orders.map((order) => (
            <Option key={order.id} value={order.id}>
              {order.orderCode}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.List name="returnItems">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Space key={field.key} align="baseline">
                <Form.Item
                  {...field}
                  label="Item"
                  name={[field.name, "itemId"]}
                  rules={[{ required: true, message: "Item is required" }]}
                >
                  <Select
                    style={{ width: 200 }}
                    placeholder="Select Item"
                    showSearch
                    optionFilterProp="children"
                  >
                    {selectedOrderItems.map((item) => (
                      <Option key={item.itemId} value={item.itemId}>
                        {allItems.find((i) => i.id === item.itemId)?.itemName ||
                          item.itemId}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  {...field}
                  label="Quantity"
                  name={[field.name, "quantity"]}
                  rules={[{ required: true, message: "Quantity is required" }]}
                >
                  <InputNumber
                    min={1}
                    max={selectedOrderItems[index]?.quantity}
                  />
                </Form.Item>
                <Form.Item
                  {...field}
                  label="Is Salable"
                  name={[field.name, "isSalable"]}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  {...field}
                  label="Reason"
                  name={[field.name, "reason"]}
                >
                  <Select style={{ width: 200 }} placeholder="Select Reason">
                    <Option value="damaged">Damaged</Option>
                    <Option value="wrong_item">Wrong Item</Option>
                    <Option value="not_needed">Not Needed</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
                <Button onClick={() => remove(field.name)}>Remove</Button>
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                disabled={!form.getFieldValue("orderId")}
              >
                Add Return Item
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
        <Button onClick={onCancel} style={{ marginLeft: 8 }}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
};

CustomerReturnForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CustomerReturnForm;
