// services/stockUpdateService.js

import axios from "axios";

const stockUpdateService = {
  getAllStockUpdates: async () => {
    const response = await axios.get("/api/stock-updates");
    return response.data;
  },

  getStockUpdateById: async (id) => {
    const response = await axios.get(`/api/stock-updates/${id}`);
    return response.data;
  },

  createStockUpdate: async (stockUpdateData) => {
    const response = await axios.post("/api/stock-updates", stockUpdateData);
    return response.data;
  },

  updateStockUpdate: async (id, stockUpdateData) => {
    const response = await axios.put(
      `/api/stock-updates/${id}`,
      stockUpdateData
    );
    return response.data;
  },

  deleteStockUpdate: async (id) => {
    await axios.delete(`/api/stock-updates/${id}`);
  },

  getStockUpdatesByItemId: async (itemId) => {
    const response = await axios.get(`/api/stock-updates/item/${itemId}`);
    return response.data;
  },

  getStockUpdatesByType: async (type) => {
    const response = await axios.get(`/api/stock-updates/type/${type}`);
    return response.data;
  },

  getStockUpdatesByDateRange: async (startDate, endDate) => {
    try {
      const response = await axios.get("/api/stock-updates/date-range", {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch stock updates by date range");
    }
  },
};

export default stockUpdateService;
