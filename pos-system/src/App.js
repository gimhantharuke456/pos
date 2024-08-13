// src/App.js
import React from "react";
import "antd/dist/reset.css";
import Dashboard from "./components/Dashboard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;
