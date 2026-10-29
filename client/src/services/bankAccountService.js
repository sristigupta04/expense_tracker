import api from "./api";

const BASE_URL = "/bank-accounts";

const bankAccountService = {
  // Get all bank accounts
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Get bank account by ID
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create a bank account
  create: async (accountData) => {
    const response = await api.post(BASE_URL, accountData);
    return response.data;
  },

  // Update bank account
  update: async (id, accountData) => {
    const response = await api.put(`${BASE_URL}/${id}`, accountData);
    return response.data;
  },

  // Delete bank account
  remove: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get transactions for a bank account
  getTransactions: async (id, params = {}) => {
    const response = await api.get(
      `${BASE_URL}/${id}/transactions`,
      { params }
    );
    return response.data;
  },

  // Get account balance
  getBalance: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/balance`);
    return response.data;
  },
};

export default bankAccountService;