import axios from "axios";

const API_URL = "/api/customers"; // Adjust if needed

const customerService = {
  createCustomer: (name, contactNumber, address, email) => {
    return axios.post(API_URL, { name, contactNumber, address, email });
  },

  getCustomerById: (id) => {
    return axios.get(`${API_URL}/${id}`);
  },

  getAllCustomers: () => {
    return axios.get(API_URL);
  },

  updateCustomer: (id, name, contactNumber, address, email) => {
    return axios.put(`${API_URL}/${id}`, {
      name,
      contactNumber,
      address,
      email,
    });
  },

  deleteCustomer: (id) => {
    return axios.delete(`${API_URL}/${id}`);
  },
};

export default customerService;
