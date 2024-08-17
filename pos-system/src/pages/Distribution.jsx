import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  message,
  Button,
  Input,
  Select,
  Space,
  Typography,
} from "antd";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { PlusCircleFilled } from "@ant-design/icons";
import distributionService from "../services/distributionService";
import supplierService from "../services/supplierService";
const { Text } = Typography;
const { Option } = Select;

const Distribution = () => {
  const [loading, setLoading] = useState(true);
  const [distributions, setDistributions] = useState([]);
  const [filteredDistributions, setFilteredDistributions] = useState([]);
  const [supplierCodes, setSupplierCodes] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [selectedSupplierCode, setSelectedSupplierCode] = useState(null);
  const [stockAmounts, setStockAmounts] = useState({});

  const calculateTotal = () => {
    return filteredDistributions.reduce((acc, item) => {
      return acc + item.inStockAmount * item.wholesalePrice;
    }, 0);
  };
  const handleStockChange = (id, value) => {
    setStockAmounts((prev) => ({ ...prev, [id]: value }));
  };
  const updateStockAmount = async (id, newAmount) => {
    try {
      await distributionService.updateStock(id, parseInt(newAmount));
      message.success("Stock amount updated successfully");
    } catch (error) {
      console.error("Failed to update stock amount", error);
      message.error("Failed to update stock amount");
    }
  };
  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        const response = await distributionService.getAllDistributions();
        const formattedData = response.data.map((item) => ({
          ...item,
          formattedDate: moment(item.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
        }));

        setFilteredDistributions(formattedData);

        let data = await supplierService.getAllSuppliers();

        setSupplierCodes(data.map((supplier) => supplier.supplierCode));
        for (var distribution of response.data) {
          handleStockChange(distribution.id, distribution.inStockAmount);
        }
      } catch (error) {
        console.error("Failed to fetch distributions", error);
        message.error("Failed to fetch distributions");
      } finally {
        setLoading(false);
      }
    };
    fetchDistributions();
  }, []);

  useEffect(() => {
    filterDistributions();
  }, [searchCode, selectedSupplierCode, distributions]);

  const filterDistributions = () => {
    let filtered = [...distributions];
    if (searchCode) {
      filtered = filtered.filter((item) =>
        item.itemCode.toLowerCase().includes(searchCode.toLowerCase())
      );
    }
    if (selectedSupplierCode) {
      filtered = filtered.filter(
        (item) => item.supplierCode === selectedSupplierCode
      );
    }
    setFilteredDistributions(filtered);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Item Name",
      "Supplier Name",
      "In Stock Amount",
      "Wholesale Price",
      "Added Date",
    ];
    const tableRows = filteredDistributions.map((distribution) => [
      distribution.itemName,
      distribution.supplierName,
      distribution.inStockAmount,
      distribution.wholesalePrice,
      distribution.formattedDate,
    ]);

    const currentDate = moment().format("YYYY-MM-DD");

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
      sorter: (a, b) => a.itemCode.localeCompare(b.itemCode),
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
    },
    {
      title: "Supplier Name",
      dataIndex: "supplierName",
      key: "supplierName",
      sorter: (a, b) => a.supplierName.localeCompare(b.supplierName),
    },
    {
      title: "Supplier Code",
      dataIndex: "supplierCode",
      key: "supplierCode",
      sorter: (a, b) => a.supplierCode.localeCompare(b.supplierCode),
    },
    {
      title: "In Stock Amount",
      dataIndex: "inStockAmount",
      key: "inStockAmount",
      sorter: (a, b) => a.inStockAmount - b.inStockAmount,
      render: (_, record) => (
        <Space>
          <Input
            placeholder={stockAmounts[record.id]}
            value={stockAmounts[record.id]}
            onChange={(e) => handleStockChange(record.id, e.target.value)}
            suffix={
              <Button
                icon={<PlusCircleFilled />}
                onClick={async () => {
                  console.log(record.distributionId);
                  await updateStockAmount(
                    record.distributionId,
                    stockAmounts[record.id]
                  );
                }}
              ></Button>
            }
          />
        </Space>
      ),
    },
    {
      title: "Distributed Price",
      dataIndex: "wholesalePrice",
      key: "wholesalePrice",
      sorter: (a, b) => a.wholesalePrice - b.wholesalePrice,
    },
    {
      title: "Amount",

      key: "amount",
      render: (_, record) =>
        (record.inStockAmount * record.wholesalePrice).toFixed(2),
    },

    {
      title: "Added Date",
      dataIndex: "formattedDate",
      key: "formattedDate",
      sorter: (a, b) => moment(a.updatedAt).unix() - moment(b.updatedAt).unix(),
    },
  ];

  if (loading) {
    return <Spin tip="Loading..." />;
  }

  return (
    <div>
      <h1>Current Stocks</h1>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by Item Code"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          style={{ width: 200, marginRight: 16 }}
        />
        <Select
          style={{ width: 200 }}
          placeholder="Filter by Supplier Code"
          allowClear
          onChange={(value) => setSelectedSupplierCode(value)}
        >
          {supplierCodes.map((code) => (
            <Option key={code} value={code}>
              {code}
            </Option>
          ))}
        </Select>
        <Button onClick={generatePDF} type="primary" style={{ marginLeft: 16 }}>
          Download Report
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredDistributions}
        rowKey="id"
        pagination={false}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5}>
                Total
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} colSpan={3}>
                <Text strong>{`LKR ${calculateTotal().toFixed(2)}`}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
};

export default Distribution;
