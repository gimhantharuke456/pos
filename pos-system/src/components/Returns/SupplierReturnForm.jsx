// src/components/Returns/SupplierReturnForm.js
import React, { useState, useEffect } from "react";
import { Form, Select, Button, InputNumber, Space, message } from "antd";
import PropTypes from "prop-types";
import { getAllItems } from "../../services/itemService";

const { Option } = Select;

const SupplierReturnForm = ({ onSubmit, onCancel, suppliers }) => {
  const [form] = Form.useForm();
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      const itemsData = await getAllItems();
      setAllItems(itemsData);
    } catch (error) {
      message.error("Failed to fetch items");
    }
  };

  const onFinish = (values) => {
    onSubmit(values);
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="supplierId"
        label="Supplier"
        rules={[{ required: true, message: "Please select a Supplier!" }]}
      >
        <Select placeholder="Select Supplier">
          {suppliers.map((supplier) => (
            <Option key={supplier.id} value={supplier.id}>
              {supplier.name}
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
                    {allItems.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.itemName}
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
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  {...field}
                  label="Reason"
                  name={[field.name, "reason"]}
                  rules={[{ required: true, message: "Reason is required" }]}
                >
                  <Select style={{ width: 200 }} placeholder="Select Reason">
                    <Option value="defective">Defective</Option>
                    <Option value="wrong_item">Wrong Item</Option>
                    <Option value="expired">Expired</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
                <Button onClick={() => remove(field.name)}>Remove</Button>
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block>
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

SupplierReturnForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  suppliers: PropTypes.array.isRequired,
};

export default SupplierReturnForm;
