import React, { useState, useEffect } from "react";
import { Select, InputNumber, Button, Form, Row } from "antd";
import { getAllItems } from "../services/itemService";

const { Option } = Select;

const ItemSelector = ({ onAddItem }) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getAllItems();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch items", error);
      }
    };
    fetchItems();
  }, []);

  const handleSelectItem = (value) => {
    const item = items.find((item) => item.id === value);
    setSelectedItem(item);
  };

  const handleAddItem = () => {
    if (selectedItem) {
      onAddItem({
        ...selectedItem,
        quantity,
        discount,
      });
      setSelectedItem(null);
      setQuantity(1);
      setDiscount(0);
    }
  };

  return (
    <>
      {" "}
      <Form.Item label="Item">
        <Select
          showSearch
          style={{ width: 400 }}
          placeholder="Select an item"
          optionFilterProp="children"
          onChange={handleSelectItem}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {items.map((item) => (
            <Option key={item.id} value={item.id}>
              {`${item.itemName} -  ${item.supplier} - Rs ${item.unitPrice}`}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Row
        style={{
          marginBottom: 20,
          alignItems: "center",
          justifyContent: "start",
        }}
      >
        <Form.Item label="Quantity">
          <InputNumber
            min={1}
            value={quantity}
            onChange={setQuantity}
            placeholder="Quantity"
            style={{ width: 100, marginLeft: 10 }}
          />
        </Form.Item>
        <Form.Item label="Discount">
          <InputNumber
            min={0}
            max={100}
            value={discount}
            onChange={setDiscount}
            placeholder="Discount (%)"
            style={{ width: 100, marginLeft: 10 }}
          />
        </Form.Item>{" "}
        <Button
          type="primary"
          onClick={handleAddItem}
          style={{ marginLeft: 10 }}
        >
          Add Item
        </Button>
      </Row>
    </>
  );
};

export default ItemSelector;
