import React, { useEffect, useState } from "react";
import { Table, Spin, message, Button } from "antd";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import distributionService from "../services/distributionService";

const Distribution = () => {
  const [loading, setLoading] = useState(true);
  const [distributions, setDistributions] = useState([]);

  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        const response = await distributionService.getAllDistributions();
        setDistributions(response.data);
      } catch (error) {
        console.error("Failed to fetch distributions", error);
        message.error("Failed to fetch distributions");
      } finally {
        setLoading(false);
      }
    };
    fetchDistributions();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Item Name", "Supplier Name", "In Stock Amount"];
    const tableRows = [];

    distributions.forEach((distribution) => {
      const distributionData = [
        distribution.itemName,
        distribution.supplierName,
        distribution.inStockAmount,
      ];
      tableRows.push(distributionData);
    });

    const currentDate = new Date().toLocaleDateString();

    doc.text("Current Stock Report", 14, 15);
    doc.text(`Date: ${currentDate}`, 14, 25);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save(`distribution_report_${currentDate}.pdf`);
  };

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
      title: "Supplier Name",
      dataIndex: "supplierName",
      key: "supplierName",
    },
    {
      title: "Supplier Code",
      dataIndex: "supplierCode",
      key: "supplierCode",
    },
    {
      title: "In Stock Amount",
      dataIndex: "inStockAmount",
      key: "inStockAmount",
    },
  ];

  if (loading) {
    return <Spin tip="Loading..." />;
  }

  return (
    <div>
      <h1>Current Stocks</h1>
      <Button
        onClick={generatePDF}
        type="primary"
        style={{ marginBottom: "20px" }}
      >
        Download Report
      </Button>
      <Table
        columns={columns}
        dataSource={distributions}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};

export default Distribution;
