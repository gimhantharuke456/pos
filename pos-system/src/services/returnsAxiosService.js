// returnsAxiosService.js
import axios from "axios";

const BASE_URL = "/api/returns";

const returnsAxiosService = {
  createReturn: (returnData) => {
    return axios.post(BASE_URL, returnData);
  },

  getReturns: () => {
    return axios.get(BASE_URL);
  },

  getReturnsByStatus: (status) => {
    return axios.get(`${BASE_URL}/status/${status}`);
  },

  getReturnCountByItem: () => {
    return axios.get(`${BASE_URL}/count`);
  },
};

export default returnsAxiosService;
