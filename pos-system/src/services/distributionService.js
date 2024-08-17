import axios from "axios";

const API_URL = "/api/distribution";

const getAllDistributions = () => {
  return axios.get(API_URL);
};

const getDistributionByItemId = async (id) => {
  return await axios.get(`${API_URL}/item/${id}`);
};

const updateStock = async (id, quantity) => {
  return await axios.patch(`${API_URL}/${id}`, { quantity });
};

const distributionService = {
  getAllDistributions,
  getDistributionByItemId,
  updateStock,
};

export default distributionService;
