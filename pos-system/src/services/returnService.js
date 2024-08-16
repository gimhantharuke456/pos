// src/services/returnService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/returns";

export const returnService = {
  createCustomerReturn: async (orderId, returnItems) => {
    const response = await axios.post(`${API_BASE_URL}/customer`, {
      orderId,
      returnItems,
    });
    return response.data;
  },

  getCustomerReturns: async () => {
    const response = await axios.get(`${API_BASE_URL}/customer`);
    return response.data;
  },

  getCustomerReturnById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/customer/${id}`);
    return response.data;
  },

  createSupplierReturn: async (supplierId, returnItems) => {
    const response = await axios.post(`${API_BASE_URL}/supplier`, {
      supplierId,
      returnItems,
    });
    return response.data;
  },

  getSupplierReturns: async () => {
    const response = await axios.get(`${API_BASE_URL}/supplier`);
    return response.data;
  },

  getSupplierReturnById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/supplier/${id}`);
    return response.data;
  },

  getNonSalableItems: async () => {
    const response = await axios.get(`${API_BASE_URL}/non-salable`);
    return response.data;
  },
};
