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
} from "antd";
import { jsPDF } from "jspdf";
import {
  addItem,
  deleteItem,
  getAllItems,
  getItemByName,
  updateItem,
} from "../services/itemService";
import supplierService from "../services/supplierService";

const { Option } = Select;

const ItemManagement = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, []);

  const fetchItems = async () => {
    const result = await getAllItems();
    setItems(result);
  };

  const fetchSuppliers = async () => {
    const result = await supplierService.getAllSuppliers();
    setSuppliers(result);
  };

  const handleSearch = async (event) => {
    setSearchTerm(event.target.value);
    const result = await getItemByName(event.target.value);
    setItems(result);
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
    items.forEach((item, index) => {
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
    { title: "Item Code", dataIndex: "itemCode", key: "itemCode" },
    { title: "Item Name", dataIndex: "itemName", key: "itemName" },
    { title: "Unit Type", dataIndex: "unitType", key: "unitType" },

    {
      title: "Discount 1 (%)",
      dataIndex: "discountPercentage1",
      key: "discountPercentage1",
    },
    {
      title: "Discount 2 (%)",
      dataIndex: "discountPercentage2",
      key: "discountPercentage2",
    },
    { title: "Unit Price", dataIndex: "unitPrice", key: "unitPrice" },
    {
      title: "Second Price",
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
    },
    {
      title: "Wholesale Price",
      dataIndex: "wholesalePrice",
      key: "wholesalePrice",
    },
    { title: "Supplier", dataIndex: "supplier", key: "supplier" },
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
      <Input
        placeholder="Search by item name"
        value={searchTerm}
        onChange={handleSearch}
        style={{ width: 300, marginBottom: 20 }}
      />
      <Button
        type="primary"
        onClick={openAddModal}
        style={{ marginBottom: 20, marginLeft: 20 }}
      >
        Add Item
      </Button>
      <Button
        type="primary"
        onClick={downloadReport}
        style={{ marginBottom: 20, marginLeft: 20 }}
      >
        Download Report
      </Button>
      <Table columns={columns} dataSource={items} rowKey="id" />
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
            rules={[{ required: true, message: "Please input the item name!" }]}
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
                <Option key={supplier.id} value={supplier.id}></Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ItemManagement;
