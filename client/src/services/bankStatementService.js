import api from "./api";

const BASE_URL = "/bank-statements";

const bankStatementService = {
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  getById: async (statementId) => {
    if (!statementId) {
      throw new Error("Statement ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(statementId)}`
    );

    return response.data;
  },

  upload: async (file, accountId, options = {}) => {
    if (!file || typeof file !== "object" || typeof file.name !== "string") {
      throw new Error("Please select a valid statement file.");
    }

    if (!accountId) {
      throw new Error("Please select a bank account.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);

    if (options.statementDate) {
      formData.append("statementDate", options.statementDate);
    }

    if (options.notes) {
      formData.append("notes", options.notes);
    }

    const response = await api.post(`${BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": undefined,
      },
    });

    return response.data;
  },

  importTransactions: async (payload) => {
    if (!payload?.accountId) {
      throw new Error("Bank account ID is required.");
    }

    if (
      !Array.isArray(payload.transactions) ||
      payload.transactions.length === 0
    ) {
      throw new Error("At least one transaction is required.");
    }

    const response = await api.post(`${BASE_URL}/import`, payload);
    return response.data;
  },

  getTransactions: async (statementId, params = {}) => {
    if (!statementId) {
      throw new Error("Statement ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(statementId)}/transactions`,
      { params }
    );

    return response.data;
  },

  reconcile: async (statementId, options = {}) => {
    if (!statementId) {
      throw new Error("Statement ID is required.");
    }

    const response = await api.post(
      `${BASE_URL}/${encodeURIComponent(statementId)}/reconcile`,
      options
    );

    return response.data;
  },

  getReconciliation: async (statementId) => {
    if (!statementId) {
      throw new Error("Statement ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(statementId)}/reconciliation`
    );

    return response.data;
  },

  remove: async (statementId) => {
    if (!statementId) {
      throw new Error("Statement ID is required.");
    }

    const response = await api.delete(
      `${BASE_URL}/${encodeURIComponent(statementId)}`
    );

    return response.data;
  },
};

export default bankStatementService;