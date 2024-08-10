import axios from "axios";

const API_URL = "/api/distribution";

const getAllDistributions = () => {
  return axios.get(API_URL);
};

const getDistributionByItemId = async (id) => {
  return await axios.get(`${API_URL}/item/${id}`);
};

const distributionService = {
  getAllDistributions,
  getDistributionByItemId,
};

export default distributionService;
