import api from "./api";

const BASE_URL = "/bank-accounts";

const bankAccountService = {
  // Get all bank accounts
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Get account by ID
  getById: async (id) => {
    if (!id) throw new Error("Bank account ID is required.");

    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create account
  create: async (accountData) => {
    if (!accountData || typeof accountData !== "object") {
      throw new Error("Valid bank account details are required.");
    }

    const response = await api.post(BASE_URL, accountData);
    return response.data;
  },

  // Update account
  update: async (id, accountData) => {
    if (!id) throw new Error("Bank account ID is required.");

    const response = await api.put(`${BASE_URL}/${id}`, accountData);
    return response.data;
  },

  // Delete account
  remove: async (id) => {
    if (!id) throw new Error("Bank account ID is required.");

    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get account transactions
  getTransactions: async (id, params = {}) => {
    if (!id) throw new Error("Bank account ID is required.");

    const response = await api.get(
      `${BASE_URL}/${id}/transactions`,
      { params }
    );

    return response.data;
  },

  // Get account balance
  getBalance: async (id) => {
    if (!id) throw new Error("Bank account ID is required.");

    const response = await api.get(`${BASE_URL}/${id}/balance`);
    return response.data;
  },
};

export default bankAccountService;