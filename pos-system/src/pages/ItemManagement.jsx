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
  Select,
  Row,
  Col,
} from "antd";
import { jsPDF } from "jspdf";
import {
  addItem,
  deleteItem,
  getAllItems,
  updateItem,
} from "../services/itemService";
import supplierService from "../services/supplierService";

const { Option } = Select;

const ItemManagement = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [nameSearch, setNameSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [nameSearch, codeSearch, items]);

  const fetchItems = async () => {
    const result = await getAllItems();
    setItems(result);
    setFilteredItems(result);
  };

  const fetchSuppliers = async () => {
    const result = await supplierService.getAllSuppliers();
    setSuppliers(result);
  };

  const handleSearch = () => {
    const filtered = items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(nameSearch.toLowerCase()) &&
        item.itemCode.toLowerCase().includes(codeSearch.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const handleAddOrUpdateItem = async (values) => {
    if (isEditing) {
      await updateItem(selectedItem.id, values);
      message.success("Item updated successfully!");
    } else {
      await addItem(values);
      message.success("Item added successfully!");
    }
    setIsModalVisible(false);
    setSelectedItem(null);
    form.resetFields();
    fetchItems();
  };

  const handleDeleteItem = async (id) => {
    await deleteItem(id);
    message.success("Item deleted successfully!");
    fetchItems();
  };

  const openAddModal = () => {
    setIsEditing(false);
    setIsModalVisible(true);
    form.resetFields();
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setSelectedItem(item);
    setIsModalVisible(true);
    form.setFieldsValue(item);
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.text("Item Report", 10, 10);
    filteredItems.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.itemName} - ${item.unitType} - Unit Price: ${
          item.unitPrice
        } - Wholesale Price: ${item.wholesalePrice} - ${item.supplier}`,
        10,
        20 + index * 10
      );
    });
    doc.save("item-report.pdf");
  };

  const columns = [
    {
      title: "Item Code",
      dataIndex: "itemCode",
      key: "itemCode",
      sorter: (a, b) => a.itemCode.localeCompare(b.itemCode),
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
    },
    {
      title: "Unit Type",
      dataIndex: "unitType",
      key: "unitType",
      sorter: (a, b) => a.unitType.localeCompare(b.unitType),
    },
    {
      title: "Discount 1 (%)",
      dataIndex: "discountPercentage1",
      key: "discountPercentage1",
      sorter: (a, b) => a.discountPercentage1 - b.discountPercentage1,
    },
    {
      title: "Discount 2 (%)",
      dataIndex: "discountPercentage2",
      key: "discountPercentage2",
      sorter: (a, b) => a.discountPercentage2 - b.discountPercentage2,
    },
    {
      title: "Retail Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      sorter: (a, b) => a.unitPrice - b.unitPrice,
    },
    {
      title: "Customer Discount",
      dataIndex: "secondPrice",
      key: "abc",
      render: (_, record) => {
        return (
          <span>
            {record.unitPrice -
              (record.unitPrice * record.discountPercentage1) / 100}
          </span>
        );
      },
      sorter: (a, b) =>
        a.unitPrice -
        (a.unitPrice * a.discountPercentage1) / 100 -
        (b.unitPrice - (b.unitPrice * b.discountPercentage1) / 100),
    },
    {
      title: "Distributed Discount",
      dataIndex: "wholesalePrice",
      key: "wholesalePrice",
      sorter: (a, b) => a.wholesalePrice - b.wholesalePrice,
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      sorter: (a, b) => a.supplier.localeCompare(b.supplier),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => openEditModal(record)}>Update</Button>
          <Popconfirm
            title="Are you sure to delete this item?"
            onConfirm={() => handleDeleteItem(record.id)}
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
      <h2>Item Management</h2>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Input
            placeholder="Search by item name"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <Input
            placeholder="Search by item code"
            value={codeSearch}
            onChange={(e) => setCodeSearch(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <Space>
            <Button type="primary" onClick={openAddModal}>
              Add Item
            </Button>
            <Button type="primary" onClick={downloadReport}>
              Download Report
            </Button>
          </Space>
        </Col>
      </Row>
      <Table columns={columns} dataSource={filteredItems} rowKey="id" />
      <Modal
        title={isEditing ? "Update Item" : "Add Item"}
        open={isModalVisible}
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
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdateItem}>
          <Form.Item
            label="Item code"
            name="itemCode"
            rules={[{ required: true, message: "Please input the item code!" }]}
          >
            <Input placeholder="Item Code" />
          </Form.Item>
          <Form.Item
            label="Item Name"
            name="itemName"
            rules={[{ required: true, message: "Please input the item name!" }]}
          >
            <Input placeholder="Item Name" />
          </Form.Item>
          <Form.Item
            label="Unit Type"
            name="unitType"
            rules={[{ required: true, message: "Please input the unit type!" }]}
          >
            <Input placeholder="Unit Type" />
          </Form.Item>
          <Form.Item
            label="Unit Price"
            name="unitPrice"
            rules={[
              { required: true, message: "Please input the unit price!" },
            ]}
          >
            <Input type="number" step="0.01" placeholder="Unit Price" />
          </Form.Item>
          <Form.Item
            label="Discount Percentage 1"
            name="discountPercentage1"
            rules={[
              {
                required: true,
                message: "Please input the first discount percentage!",
              },
            ]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Discount Percentage 1"
            />
          </Form.Item>
          <Form.Item
            label="Discount Percentage 2"
            name="discountPercentage2"
            rules={[
              {
                required: true,
                message: "Please input the second discount percentage!",
              },
            ]}
          >
            <Input
              type="number"
              step="0.01"
              placeholder="Discount Percentage 2"
            />
          </Form.Item>
          <Form.Item
            label="Supplier"
            name="supplier"
            rules={[{ required: true, message: "Please select a supplier!" }]}
          >
            <Select disabled={isEditing} placeholder="Select supplier">
              {suppliers.map((supplier) => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.supplierCode}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ItemManagement;
