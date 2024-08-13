// src/services/reportService.js
import axios from "axios";

const API_URL = "/api/reports";

const reportService = {
  async getStockReport(supplierId, fromDate, toDate) {
    try {
      const response = await axios.get(`${API_URL}/stock`, {
        params: { supplierId, fromDate, toDate },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching stock report:", error);
      throw error;
    }
  },
};

export default reportService;
