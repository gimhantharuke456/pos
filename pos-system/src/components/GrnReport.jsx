import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Descriptions,
  Spin,
  message,
  Button,
  Popconfirm,
} from "antd";
import grnService from "../services/grnService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const GrnReport = ({ grnId, refresh }) => {
  const [loading, setLoading] = useState(true);
  const [grnData, setGrnData] = useState(null);

  useEffect(() => {
    const fetchGrnReport = async () => {
      try {
        const response = await grnService.getGRNById(grnId);
        setGrnData(response.data);
      } catch (error) {
        console.error("Failed to fetch GRN report", error);
        message.error("Failed to fetch GRN report");
      } finally {
        setLoading(false);
      }
    };
    fetchGrnReport();
  }, [grnId]);

  const handleAcceptGrn = async () => {
    await grnService.updateGRNStatus(grnId, "ACCEPTED");
    message.success("GRN Accepted");
    refresh();
  };

  const generatePdf = () => {
    const input = document.getElementById("grn-report");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`GRN_Report_${grnId}.pdf`);
    });
  };

  if (loading) {
    return <Spin tip="Loading..." />;
  }

  if (!grnData) {
    return <div>No data available</div>;
  }

  const columns = [
    {
      title: "Item ID",
      dataIndex: "itemId",
      key: "itemId",
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
      title: "First Margin",
      dataIndex: "secondPrice",
      key: "secondPrice",
    },
    {
      title: "Wholesale Price",
      dataIndex: "wholesalePrice",
      key: "wholesalePrice",
    },
    {
      title: "Ordered Quantity",
      dataIndex: "orderedQuantity",
      key: "orderedQuantity",
    },
    {
      title: "Received Quantity",
      dataIndex: "receivedQuantity",
      key: "receivedQuantity",
    },
    {
      title: "Total Ordered Amount",
      dataIndex: "total",
      key: "total",
      render: (_, record) => {
        const total =
          record.orderedQuantity *
          (record.secondPrice || record.wholesalePrice);
        return total;
      },
    },
    {
      title: "Total Recieved Amount",
      dataIndex: "recievedAmount",
      key: "recievedAmount",
      render: (_, record) => {
        const total =
          record.receivedQuantity *
          (record.secondPrice || record.wholesalePrice);
        return total;
      },
    },
  ];

  return (
    <Card id="grn-report">
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Purchase Order Code">
          {grnData.purchaseOrderCode}
        </Descriptions.Item>
        <Descriptions.Item label="Receive Date">
          {grnData.receiveDate}
        </Descriptions.Item>
        <Descriptions.Item label="Status">{grnData.status}</Descriptions.Item>
        <Descriptions.Item label="Supplier Code">
          {grnData.supplierCode}
        </Descriptions.Item>
      </Descriptions>

      <Table
        columns={columns}
        dataSource={grnData.items}
        rowKey="id"
        pagination={false}
        style={{ marginTop: "20px" }}
      />
      <div style={{ marginTop: "20px" }}>
        {grnData.status !== "ACCEPTED" && (
          <Popconfirm
            title="Are you sure to accept this GRN?"
            onConfirm={handleAcceptGrn}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" style={{ marginRight: "10px" }}>
              Accept GRN
            </Button>
          </Popconfirm>
        )}
        <Button type="default" onClick={generatePdf}>
          Download PDF
        </Button>
      </div>
    </Card>
  );
};

export default GrnReport;
