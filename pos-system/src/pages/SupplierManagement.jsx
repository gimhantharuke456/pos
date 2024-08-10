// src/components/SupplierManagement.js
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  Space,
  message,
  Modal,
  Popconfirm,
  Row,
} from "antd";
import supplierService from "../services/supplierService";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const result = await supplierService.getAllSuppliers();
    setSuppliers(result);
  };

  const handleSearch = async (event) => {
    setSearchTerm(event.target.value);
    const result = await supplierService.getSupplierByName(event.target.value);
    setSuppliers(result);
  };

  const handleAddOrUpdateSupplier = async (values) => {
    if (isEditing) {
      await supplierService.updateSupplier(selectedSupplier.id, values);
      message.success("Supplier updated successfully!");
    } else {
      await supplierService.addSupplier(values);
      message.success("Supplier added successfully!");
    }
    setIsModalVisible(false);
    setSelectedSupplier(null);
    form.resetFields();
    fetchSuppliers();
  };

  const handleDeleteSupplier = async (id) => {
    await supplierService.deleteSupplier(id);
    message.success("Supplier deleted successfully!");
    fetchSuppliers();
  };

  const openAddModal = () => {
    setIsEditing(false);
    setIsModalVisible(true);
    form.resetFields();
  };

  const openEditModal = (supplier) => {
    setIsEditing(true);
    setSelectedSupplier(supplier);
    setIsModalVisible(true);
    form.setFieldsValue(supplier);
  };
  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Suppliers List", 14, 22);

    // Supplier table
    const tableColumn = ["Name", "Contact Number", "Address", "Email"];
    const tableRows = suppliers.map((supplier) => [
      supplier.name,
      supplier.contactNumber,
      supplier.address,
      supplier.email,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: {
        fontSize: 12,
        cellPadding: 3,
        lineColor: [44, 62, 80],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [225, 225, 225],
      },
    });

    // Save the PDF
    doc.save("suppliers-list.pdf");
  };

  const columns = [
    {
      title: "Supplier Code",
      dataIndex: "supplierCode",
      key: "supplierCode",
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
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => openEditModal(record)}>Update</Button>
          <Popconfirm
            title="Are you sure to delete this supplier?"
            onConfirm={() => handleDeleteSupplier(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Supplier Management</h2>
      <Row justify={"space-between"}>
        <Input
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: 300, marginBottom: 20 }}
        />
        <div>
          <Button
            type="primary"
            onClick={openAddModal}
            style={{ marginBottom: 20, marginRight: 20 }}
          >
            Add Supplier
          </Button>
          <Button
            type="dashed"
            onClick={generatePDF}
            style={{ marginBottom: 20 }}
          >
            Get a Report
          </Button>
        </div>
      </Row>
      <Table columns={columns} dataSource={suppliers} rowKey="id" />
      <Modal
        title={isEditing ? "Update Supplier" : "Add Supplier"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {isEditing ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrUpdateSupplier}
        >
          <Form.Item
            label="Supplier Code"
            name="supplierCode"
            rules={[
              { required: true, message: "Please input the supplier code!" },
            ]}
          >
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item
            label="Contact Number"
            name="contactNumber"
            rules={[
              { required: true, message: "Please input the contact number!" },
            ]}
          >
            <Input placeholder="Contact Number" />
          </Form.Item>
          <Form.Item label="Address" name="address">
            <Input placeholder="Address" />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input placeholder="Email" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierManagement;
