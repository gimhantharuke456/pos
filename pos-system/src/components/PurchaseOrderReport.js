import React, { useEffect, useState } from "react";
import { Card, Typography, Table, Button, Row, Divider } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { purchaseOrderService } from "../services/purchaseOrderService";
import { usePDF } from "react-to-pdf";

const { Title, Text } = Typography;

const PurchaseOrderReport = ({ purchaseOrderId }) => {
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const { toPDF, targetRef } = usePDF({ filename: "purchase_order.pdf" });

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const response = await purchaseOrderService.getPurchaseOrder(
          purchaseOrderId
        );
        setPurchaseOrder(response.data);
      } catch (error) {
        console.error("Failed to fetch purchase order", error);
      }
    };
    fetchPurchaseOrder();
  }, [purchaseOrderId]);

  if (!purchaseOrder) return <div>Loading...</div>;

  const columns = [
    { title: "Item Code", dataIndex: "itemCode", key: "itemCode" },
    { title: "Item", dataIndex: "itemName", key: "item" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Retail Price", dataIndex: "unitPrice", key: "unitPrice" },
    {
      title: "Customer Margin",
      dataIndex: "secondPrice",
      key: "abc",
      render: (_, record) => {
        return <span>{record.discountPercentage1}</span>;
      },
    },

    {
      title: "Amount",
      key: "total",
      render: (_, record) => (record?.secondPrice).toFixed(2),
    },
  ];

  const total = purchaseOrder.items?.reduce(
    (sum, item) => sum + item.quantity * item?.secondPrice,
    0
  );

  const poValue = purchaseOrder?.items.reduce(
    (sum, item) => sum + item.quantity * item?.unitPrice,
    0
  );

  return (
    <Card>
      <div ref={targetRef}>
        <Title level={3}>Purchase Order Report</Title>
        <Text strong>Purchase Order ID: </Text>
        <Text>{purchaseOrder.purchaseOrderCode}</Text>
        <br />
        <Text strong>Order Date: </Text>
        <Text>{new Date(purchaseOrder.orderDate).toLocaleDateString()}</Text>
        <br />
        <Text strong>Supplier: </Text>
        <Text>{purchaseOrder?.supplierName}</Text>
        <br />
        <Text strong>Status: </Text>
        <Text>{purchaseOrder.status}</Text>
        <br />
        <br />
        <Table
          columns={columns}
          dataSource={purchaseOrder.items}
          rowKey="id"
          pagination={false}
        />
        <br />
        <Row justify={"end"}>
          <Text strong>Total : LKR {total?.toFixed(2)}</Text>
          <br />
        </Row>
        <Divider />
        <Row justify={"end"}>
          <Text strong>
            Distributed Margin : LKR{" "}
            {(total * purchaseOrder.items[0]?.discountPercentage2) / 100}
          </Text>
        </Row>
        <Divider />
        <Row justify={"end"}>
          <Text strong>
            PO Value : LKR{" "}
            {total -
              (total * purchaseOrder.items[0]?.discountPercentage2) / 100}{" "}
          </Text>
        </Row>
      </div>
      <br />
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={() => toPDF()}
      >
        Download Order Report
      </Button>
    </Card>
  );
};

export default PurchaseOrderReport;
