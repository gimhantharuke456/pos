import React, { useState, useEffect } from "react";
import { Form, Select, Button, message, Table, Input, InputNumber } from "antd";
import customerService from "../services/customerService";
import supplierService from "../services/supplierService";
import distributionService from "../services/distributionService";
import debounce from "lodash/debounce";

const { Option } = Select;
const { Search } = Input;

const OrderForm = ({ onSubmit, initialValues }) => {
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [form] = Form.useForm();
  const [orderCode, setOrderCode] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const generateCode = () => {
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `CO-${currentDate}-${randomNum}`;
  };

  useEffect(() => {
    fetchCustomers();
    fetchSuppliers();
    setOrderCode(generateCode());
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      fetchItems();
    }
  }, [selectedSupplier]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery]);

  useEffect(() => {
    filterCustomers();
  }, [customers, customerSearchQuery]);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data.data);
      setFilteredCustomers(data.data);
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

  const fetchItems = async () => {
    try {
      const data = await distributionService.getAllDistributions();
      const filteredItems = data.data.filter(
        (item) => item.supplierId === selectedSupplier
      );
      setItems(
        filteredItems.map((item) => ({
          ...item,
          quantity: 0,
          discount: 0,
        }))
      );
    } catch (error) {
      message.error("Failed to fetch items");
    }
  };

  const filterItems = () => {
    const filtered = items.filter(
      (item) =>
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const filterCustomers = () => {
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleSubmit = (values) => {
    setSearchQuery("");
    const orderedItems = filteredItems.filter((item) => item.quantity > 0);
    let totalAmount = 0;
    orderedItems.forEach((item) => {
      totalAmount += item.quantity * item.unitPrice;
    });

    totalAmount = totalAmount - (totalAmount * values.discount) / 100;
    console.log(totalAmount, values.discount);
    onSubmit({
      ...values,
      items: orderedItems,
      totalAmount,
    });

    // Clean all inputs after creating order
    form.resetFields();
    setItems(items.map((item) => ({ ...item, quantity: 0, discount: 0 })));
    setSelectedSupplier(null);
    setSearchQuery("");
    setCustomerSearchQuery("");
  };

  const handleQuantityChange = (itemId, value) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, quantity: value } : item
      )
    );
  };

  const handleDiscountChange = (value) => {
    let i = [];
    setItems(
      items.forEach((item) => {
        i.push({ ...item, discount: value });
      })
    );
    setItems(i);
  };

  const handleSupplierChange = (value) => {
    setSelectedSupplier(value);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleCustomerSearch = debounce((value) => {
    setCustomerSearchQuery(value);
  }, 300);

  const columns = [
    {
      title: "Item Code",
      dataIndex: "itemCode",
      key: "itemCode",
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Unit Price",
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
          max={record.inStockAmount}
          value={record.quantity}
          placeholder={`${record.inStockAmount}`}
          onChange={(value) => handleQuantityChange(record.id, value)}
        />
      ),
    },
    {
      title: "Total Price",
      key: "totalPrice",
      render: (_, record) => (
        <>{record.unitPrice * record.quantity * (1 - record.discount / 100)}</>
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
      <Form.Item name="orderCode" label="Customer Invoice Number">
        <Input placeholder={orderCode} />
      </Form.Item>
      <Form.Item name="orderDate" label="Order Date">
        <Input type="date" />
      </Form.Item>
      <Form.Item
        name="customerId"
        label="Customer"
        rules={[{ required: true }]}
      >
        <Select
          showSearch
          placeholder="Search and select a customer"
          filterOption={false}
          onSearch={handleCustomerSearch}
          notFoundContent={null}
        >
          {filteredCustomers.map((customer) => (
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
        <Select placeholder="Select a supplier" onChange={handleSupplierChange}>
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

      {selectedSupplier && (
        <>
          <Form.Item label="Search Items">
            <Search
              placeholder="Search by item code or name"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ marginBottom: 16 }}
            />
          </Form.Item>
          <Table
            columns={columns}
            dataSource={filteredItems}
            rowKey={(record) => record.id}
            pagination={false}
            style={{ marginBottom: 20 }}
          />
        </>
      )}
      <Form.Item
        initialValue={0}
        name="discount"
        label="Discount"
        rules={[{ required: true }]}
      >
        <InputNumber
          onChange={(value) => handleDiscountChange(parseInt(value))}
          type="number"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {initialValues ? "Update Order" : "Create Order"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OrderForm;
