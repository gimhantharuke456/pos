import React, { useState, useEffect } from "react";
import { Form, Select, Button, DatePicker, InputNumber } from "antd";
import moment from "moment"; // Import moment
import supplierService from "../services/supplierService";
import { getAllItems } from "../services/itemService";

const { Option } = Select;

const PurchaseOrderForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchSuppliers();
    fetchItems();
  }, []);

  useEffect(() => {
    if (initialValues) {
      // Convert the orderDate string to a moment object
      const formattedInitialValues = {
        ...initialValues,
        orderDate: initialValues.orderDate
          ? moment(initialValues.orderDate)
          : null,
      };
      form.setFieldsValue(formattedInitialValues);
    }
  }, [initialValues, form]);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAllSuppliers();
      setSuppliers(response);
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await getAllItems();
      setItems(response);
    } catch (error) {
      console.error("Failed to fetch items", error);
    }
  };

  const handleSubmit = (values) => {
    // Convert the moment object back to a string before submitting
    const formattedValues = {
      ...values,
      orderDate: values.orderDate
        ? values.orderDate.format("YYYY-MM-DD")
        : null,
      status: "PENDING",
    };
    onSubmit(formattedValues);
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="supplierId"
        label="Supplier"
        rules={[{ required: true }]}
      >
        <Select>
          {suppliers.map((supplier) => (
            <Option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="orderDate"
        label="Order Date"
        rules={[{ required: true }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <div key={field.key}>
                <Form.Item
                  name={[field.name, "itemId"]}
                  label={`Item ${index + 1}`}
                  rules={[{ required: true }]}
                >
                  <Select>
                    {items.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.itemName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name={[field.name, "quantity"]}
                  label="Quantity"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} />
                </Form.Item>
                <Button onClick={() => remove(field.name)}>Remove</Button>
              </div>
            ))}
            <Button onClick={() => add()}>Add Item</Button>
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Form.Item>
    </Form>
  );
};

export default PurchaseOrderForm;
