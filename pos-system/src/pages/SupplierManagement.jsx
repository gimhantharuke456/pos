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
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [nameSearch, setNameSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [nameSearch, codeSearch, suppliers]);

  const fetchSuppliers = async () => {
    const result = await supplierService.getAllSuppliers();
    setSuppliers(result);
    setFilteredSuppliers(result);
  };

  const handleSearch = () => {
    const filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
        supplier.supplierCode.toLowerCase().includes(codeSearch.toLowerCase())
    );
    setFilteredSuppliers(filtered);
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
    const tableColumn = [
      "Supplier Code",
      "Name",
      "Contact Number",
      "Address",
      "Email",
    ];
    const tableRows = filteredSuppliers.map((supplier) => [
      supplier.supplierCode,
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
      sorter: (a, b) => a.supplierCode.localeCompare(b.supplierCode),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
      sorter: (a, b) => a.contactNumber.localeCompare(b.contactNumber),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      sorter: (a, b) => a.address.localeCompare(b.address),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
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
      <Row justify="space-between" style={{ marginBottom: 20 }}>
        <Space>
          <Input
            placeholder="Search by name"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Input
            placeholder="Search by supplier code"
            value={codeSearch}
            onChange={(e) => setCodeSearch(e.target.value)}
            style={{ width: 200 }}
          />
        </Space>
        <Space>
          <Button type="primary" onClick={openAddModal}>
            Add Supplier
          </Button>
          <Button type="dashed" onClick={generatePDF}>
            Get a Report
          </Button>
        </Space>
      </Row>
      <Table columns={columns} dataSource={filteredSuppliers} rowKey="id" />
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
            <Input placeholder="Supplier Code" />
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
