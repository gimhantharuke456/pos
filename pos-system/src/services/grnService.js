// src/services/grnService.js
import axios from "axios";

const API_URL = "/api/grn";

const grnService = {
  createGRN: (data) => {
    return axios.post(API_URL, data);
  },

  getGRNById: (id) => {
    return axios.get(`${API_URL}/${id}`);
  },

  getAllGRNs: () => {
    return axios.get(API_URL);
  },

  updateGRNStatus: (id, status) => {
    return axios.patch(`${API_URL}/${id}/status`, { status });
  },
};

export default grnService;
