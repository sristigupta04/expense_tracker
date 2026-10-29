import api from "./api";

const BASE_URL = "/bank-statements";

const bankStatementService = {
  /**
   * Get all bank statements
   * Supports filters, pagination and search.
   */
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  /**
   * Get a single statement by ID
   */
  getById: async (statementId) => {
    if (!statementId) {
      throw new Error("Statement ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(statementId)}`
    );

    return response.data;
  },

  /**
   * Upload a bank statement file.
   * Supports CSV, PDF or other formats only if the backend supports them.
   */
  upload: async (file, accountId, options = {}) => {
    if (!(file instanceof File)) {
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

    const response = await api.post(`${BASE_URL}/upload`, formData);

    return response.data;
  },

  /**
   * Import parsed CSV transactions.
   * Use this when the frontend parses a statement before importing it.
   */
  importTransactions: async (payload) => {
    if (!payload?.accountId) {
      throw new Error("Bank account ID is required.");
    }

    if (!Array.isArray(payload.transactions) || !payload.transactions.length) {
      throw new Error("At least one transaction is required.");
    }

    const response = await api.post(`${BASE_URL}/import`, payload);
    return response.data;
  },

  /**
   * Get transactions associated with a statement
   */
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

  /**
   * Start reconciliation for a statement
   */
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

  /**
   * Get reconciliation results
   */
  getReconciliation: async (statementId) => {
    if (!statementId) {
      throw new Error("Statement ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(statementId)}/reconciliation`
    );

    return response.data;
  },

  /**
   * Delete a statement
   */
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