import axios from "axios";

const orderService = {
  getAllOrders: async () => {
    const response = await axios.get("/api/orders");
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await axios.get(`/api/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await axios.post("/api/orders", orderData);
    return response.data;
  },

  updateOrder: async (id, orderData) => {
    const response = await axios.put(`/api/orders/${id}`, orderData);
    return response.data;
  },

  deleteOrder: async (id) => {
    await axios.delete(`/api/orders/${id}`);
  },

  updatePaidAmount: async (orderId, paidAmount) => {
    try {
      const response = await axios.patch(`api/orders/${orderId}/paidAmount`, {
        paidAmount,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to update paid amount");
    }
  },

  // Update Payment Status
  updatePaymentStatus: async (orderId, paymentStatus) => {
    try {
      const response = await axios.patch(
        `api/orders/${orderId}/paymentStatus`,
        { paymentStatus }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update payment status");
    }
  },
};

export default orderService;
