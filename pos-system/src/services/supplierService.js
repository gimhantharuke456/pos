import axios from "axios";

const API_URL = "/api/suppliers";

const supplierService = {
  async getAllSuppliers() {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      return [];
    }
  },

  async getSupplierByName(name) {
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { name },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching suppliers:", error);
      return [];
    }
  },

  async addSupplier(supplier) {
    try {
      const response = await axios.post(API_URL, supplier);
      return response.data.id;
    } catch (error) {
      console.error("Error adding supplier:", error);
      throw error;
    }
  },

  async updateSupplier(id, supplier) {
    try {
      await axios.put(`${API_URL}/${id}`, supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      throw error;
    }
  },

  async deleteSupplier(id) {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw error;
    }
  },
};

export default supplierService;
