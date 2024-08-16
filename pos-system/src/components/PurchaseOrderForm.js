import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  DatePicker,
  Input,
  Table,
  InputNumber,
  Select,
} from "antd";
import moment from "moment";
import supplierService from "../services/supplierService";
import { getAllItems } from "../services/itemService";
import InstockAmount from "./InstockAmount";

const PurchaseOrderForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [purchaseOrderCode, setPurchaseOrderCode] = useState("");
  const [filetedItems, setFilteredItems] = useState([]);

  useEffect(() => {
    fetchSuppliers();
    fetchItems();
    generatePurchaseOrderCode();
  }, []);

  useEffect(() => {
    if (initialValues) {
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

  const generatePurchaseOrderCode = () => {
    const currentDate = moment().format("YYYYMMDD");
    const uniqueNumber = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const generatedCode = `PO-${currentDate}-${uniqueNumber}`;
    setPurchaseOrderCode(generatedCode);
    form.setFieldsValue({ purchaseOrderCode: generatedCode });
  };

  const onSupplierCheck = (id) => {
    console.log(id);
    setFilteredItems(items.filter((item) => item.supplierId === id));
  };

  const handleSubmit = async (values) => {
    const formattedValues = {
      ...values,
      orderDate: values.orderDate
        ? values.orderDate.format("YYYY-MM-DD")
        : null,
      status: "PENDING",
      items: items
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
        })),
    };
    await onSubmit(formattedValues);
    setItems([]);
  };

  const columns = [
    { title: "Item Code", dataIndex: "itemCode", key: "itemCode" },
    { title: "Item Name", dataIndex: "itemName", key: "itemName" },
    {
      title: "Instock Amount",
      dataIndex: "inStockAmount",
      key: "inStockAmount",
      render: (_, record) => {
        return <InstockAmount id={record.id} />;
      },
    },
    { title: "First Margin", dataIndex: "secondPrice", key: "secondPrice" },
    {
      title: "Wholesale Price",
      dataIndex: "wholesalePrice",
      key: "wholesalePrice",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <InputNumber
          min={0}
          defaultValue={0}
          onChange={(value) => {
            const updatedItems = items.map((item) =>
              item.id === record.id ? { ...item, quantity: value } : item
            );
            setItems(updatedItems);
          }}
        />
      ),
    },
  ];

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="purchaseOrderCode"
        label="Purchase Order Code"
        rules={[{ required: true }]}
      >
        <Input disabled value={purchaseOrderCode} />
      </Form.Item>
      <Form.Item
        name="supplierId"
        label="Supplier"
        rules={[{ required: true }]}
      >
        <Select
          onChange={(val) => {
            onSupplierCheck(val);
          }}
        >
          {suppliers.map((supplier) => (
            <Select.Option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </Select.Option>
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
      <Table
        dataSource={filetedItems}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
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
