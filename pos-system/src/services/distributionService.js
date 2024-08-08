import axios from "axios";

const API_URL = "/api/distribution";

const getAllDistributions = () => {
  return axios.get(API_URL);
};

const distributionService = {
  getAllDistributions,
};

export default distributionService;
