// src/components/Dashboard.js
import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  FileDoneOutlined,
  ShopOutlined,
  BarChartOutlined,
  DollarOutlined,
  SettingOutlined,
  BackwardFilled,
} from "@ant-design/icons";
import SupplierManagement from "../pages/SupplierManagement";
import ItemManagement from "../pages/ItemManagement";
import PurchaseOrderList from "./PurchaseOrderList";
import GrnManagement from "../pages/GrnManagement";
import Distribution from "../pages/Distribution";
import CustomerManagement from "../pages/CustomerManagement";
import Orders from "../pages/Orders";
import Reports from "./Reports";
import Returns from "./Returns";
import StockReport from "./StockReport";

const { Sider, Content } = Layout;

const Dashboard = () => {
  const [activeIndex, setActiveIndex] = React.useState(1);
  const onMenuItemClick = (index) => {
    setActiveIndex(index);
  };
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div
          className="logo"
          style={{
            height: "32px",
            margin: "16px",
            color: "white",
            textAlign: "center",
          }}
        >
          Wholesale System
        </div>
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item
            onClick={() => onMenuItemClick(1)}
            key="1"
            icon={<UserOutlined />}
          >
            Supplier Management
          </Menu.Item>
          <Menu.Item
            onClick={() => onMenuItemClick(2)}
            key="2"
            icon={<FileDoneOutlined />}
          >
            Item Management
          </Menu.Item>
          <Menu.Item
            onClick={() => onMenuItemClick(3)}
            key="3"
            icon={<ShopOutlined />}
          >
            Purchase Orders
          </Menu.Item>
          <Menu.Item
            onClick={() => onMenuItemClick(4)}
            key="4"
            icon={<FileDoneOutlined />}
          >
            Goods Receive Notes
          </Menu.Item>
          <Menu.Item
            onClick={() => onMenuItemClick(5)}
            key="5"
            icon={<ShopOutlined />}
          >
            Distribution
          </Menu.Item>
          <Menu.Item
            onClick={() => onMenuItemClick(6)}
            key="6"
            icon={<UserOutlined />}
          >
            Retailer Management
          </Menu.Item>
          <Menu.Item
            onClick={() => onMenuItemClick(7)}
            key="7"
            icon={<DollarOutlined />}
          >
            Orders
          </Menu.Item>
          <Menu.Item
            onClick={() => onMenuItemClick(8)}
            key="8"
            icon={<BarChartOutlined />}
          >
            Reporting
          </Menu.Item>
          <Menu.Item
            onClick={() => onMenuItemClick(9)}
            key="9"
            icon={<SettingOutlined />}
          >
            Returns
          </Menu.Item>
          <Menu.Item
            onClick={() => onMenuItemClick(10)}
            key="10"
            icon={<BackwardFilled />}
          >
            Stock Report
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: "16px" }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            {activeIndex === 1 && <SupplierManagement />}
            {activeIndex === 2 && <ItemManagement />}
            {activeIndex === 3 && <PurchaseOrderList />}
            {activeIndex === 4 && <GrnManagement />}
            {activeIndex === 5 && <Distribution />}
            {activeIndex === 6 && <CustomerManagement />}
            {activeIndex === 7 && <Orders />}
            {activeIndex === 8 && <Reports />}
            {activeIndex === 9 && <Returns />}
            {activeIndex === 10 && <StockReport />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
