import api from "./api";

const BASE_URL = "/bank-transactions";

const bankTransactionService = {
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  getById: async (transactionId) => {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(transactionId)}`
    );

    return response.data;
  },

  getByAccount: async (accountId, params = {}) => {
    if (!accountId) {
      throw new Error("Bank account ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/account/${encodeURIComponent(accountId)}`,
      { params }
    );

    return response.data;
  },

  create: async (transactionData) => {
    if (
      !transactionData ||
      typeof transactionData !== "object" ||
      Array.isArray(transactionData)
    ) {
      throw new Error("Valid transaction data is required.");
    }

    const response = await api.post(BASE_URL, transactionData);
    return response.data;
  },

  update: async (transactionId, transactionData) => {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    if (!transactionData || typeof transactionData !== "object") {
      throw new Error("Valid transaction data is required.");
    }

    const response = await api.put(
      `${BASE_URL}/${encodeURIComponent(transactionId)}`,
      transactionData
    );

    return response.data;
  },

  remove: async (transactionId) => {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    const response = await api.delete(
      `${BASE_URL}/${encodeURIComponent(transactionId)}`
    );

    return response.data;
  },

  getFiltered: async (filters = {}) => {
    const {
      accountId,
      type,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
    } = filters;

    if (!Number.isInteger(Number(page)) || Number(page) < 1) {
      throw new Error("Page must be a positive integer.");
    }

    if (!Number.isInteger(Number(limit)) || Number(limit) < 1) {
      throw new Error("Limit must be a positive integer.");
    }

    if (
      minAmount !== undefined &&
      minAmount !== "" &&
      !Number.isFinite(Number(minAmount))
    ) {
      throw new Error("Minimum amount must be a valid number.");
    }

    if (
      maxAmount !== undefined &&
      maxAmount !== "" &&
      !Number.isFinite(Number(maxAmount))
    ) {
      throw new Error("Maximum amount must be a valid number.");
    }

    const params = {
      ...(accountId && { accountId }),
      ...(type && type !== "All" && { type }),
      ...(status && status !== "All" && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(minAmount !== undefined && minAmount !== "" && { minAmount }),
      ...(maxAmount !== undefined && maxAmount !== "" && { maxAmount }),
      ...(search?.trim() && { search: search.trim() }),
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
    };

    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  markMatched: async (transactionId, matchData = {}) => {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    const response = await api.patch(
      `${BASE_URL}/${encodeURIComponent(transactionId)}/match`,
      matchData
    );

    return response.data;
  },

  getSummary: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/summary`, { params });
    return response.data;
  },
};

export default bankTransactionService;