import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
} from "antd";
import customerService from "../services/customerService";
import { DeleteOutlined } from "@ant-design/icons";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAllCustomers();
      setCustomers(response.data);
    } catch (error) {
      message.error("Failed to fetch customers");
    }
  };

  const handleAddOrEdit = async (values) => {
    if (editingCustomer) {
      // Update customer
      await customerService
        .updateCustomer(
          editingCustomer.id,
          values.name,
          values.contactNumber,
          values.address,
          values.email,
          values.customerCode
        )
        .then(() => {
          message.success("Customer updated successfully");
          fetchCustomers();
        })
        .catch(() => {
          message.error("Failed to update customer");
        });
    } else {
      // Create new customer
      await customerService
        .createCustomer(
          values.name,
          values.contactNumber,
          values.address,
          values.email,
          values.customerCode
        )
        .then(() => {
          message.success("Customer created successfully");
          fetchCustomers();
        })
        .catch(() => {
          message.error("Failed to create customer");
        });
    }
    setIsModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    customerService
      .deleteCustomer(id)
      .then(() => {
        message.success("Customer deleted successfully");
        fetchCustomers();
      })
      .catch(() => {
        message.error("Failed to delete customer");
      });
  };

  const columns = [
    {
      title: "Customer Code",
      dataIndex: "customerCode",
      key: "customerCode",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this customer?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} type="danger"></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Add Customer
      </Button>
      <Table columns={columns} dataSource={customers} rowKey="id" />

      <Modal
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCustomer(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleAddOrEdit}>
          <Form.Item
            name="customerCode"
            label="Customer Code"
            rules={[
              { required: true, message: "Please input the customer code!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="contactNumber" label="Contact Number">
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please input the address!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingCustomer ? "Update" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
