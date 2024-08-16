// src/components/Returns/Returns.js
import React, { useState } from "react";
import { Tabs } from "antd";
import CustomerReturns from "./Returns/CustomerReturns";
import SupplierReturns from "./Returns/SupplierReturns";
import NonSalableItems from "./Returns/NonSalableItems";

const { TabPane } = Tabs;

const Returns = () => {
  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div>
      <h1>Returns Management</h1>
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Customer Returns" key="1">
          <CustomerReturns />
        </TabPane>
        <TabPane tab="Supplier Returns" key="2">
          <SupplierReturns />
        </TabPane>
        <TabPane tab="Non-Salable Items" key="3">
          <NonSalableItems />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Returns;
