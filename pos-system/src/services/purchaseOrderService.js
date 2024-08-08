import axios from "axios";

const API_URL = "/api/purchase-orders";

export const purchaseOrderService = {
  getAllPurchaseOrders: () => axios.get(API_URL),
  getPurchaseOrder: (id) => axios.get(`${API_URL}/${id}`),
  createPurchaseOrder: (data) => axios.post(API_URL, data),
  updatePurchaseOrder: (id, data) => axios.put(`${API_URL}/${id}`, data),
  deletePurchaseOrder: (id) => axios.delete(`${API_URL}/${id}`),
};
