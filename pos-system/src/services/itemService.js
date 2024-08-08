import axios from "axios";

const API_URL = "/api/items";

export const getAllItems = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};

export const addItem = async (item) => {
  try {
    const response = await axios.post(API_URL, item);
    return response.data.id;
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
};

export const updateItem = async (id, item) => {
  try {
    await axios.put(`${API_URL}/${id}`, item);
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

export const deleteItem = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

export const getItemByName = async (name) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { name },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching items:", error);
    return [];
  }
};
