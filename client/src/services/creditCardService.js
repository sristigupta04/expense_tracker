import api from "./api";

const BASE_URL = "/credit-cards";

const creditCardService = {
  // Get all credit cards
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Get credit card details by ID
  getById: async (cardId) => {
    if (!cardId) {
      throw new Error("Credit card ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(cardId)}`
    );

    return response.data;
  },

  // Add a new credit card
  create: async (cardData) => {
    if (!cardData) {
      throw new Error("Credit card data is required.");
    }

    const response = await api.post(BASE_URL, cardData);
    return response.data;
  },

  // Update credit card details
  update: async (cardId, cardData) => {
    if (!cardId) {
      throw new Error("Credit card ID is required.");
    }

    const response = await api.put(
      `${BASE_URL}/${encodeURIComponent(cardId)}`,
      cardData
    );

    return response.data;
  },

  // Delete a credit card
  remove: async (cardId) => {
    if (!cardId) {
      throw new Error("Credit card ID is required.");
    }

    const response = await api.delete(
      `${BASE_URL}/${encodeURIComponent(cardId)}`
    );

    return response.data;
  },

  // Get transactions for a credit card
  getTransactions: async (cardId, params = {}) => {
    if (!cardId) {
      throw new Error("Credit card ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(cardId)}/transactions`,
      { params }
    );

    return response.data;
  },

  // Record a credit card payment
  makePayment: async (cardId, paymentData) => {
    if (!cardId) {
      throw new Error("Credit card ID is required.");
    }

    if (!paymentData || Number(paymentData.amount) <= 0) {
      throw new Error("Enter a valid payment amount.");
    }

    const response = await api.post(
      `${BASE_URL}/${encodeURIComponent(cardId)}/payments`,
      paymentData
    );

    return response.data;
  },

  // Get payment history
  getPayments: async (cardId, params = {}) => {
    if (!cardId) {
      throw new Error("Credit card ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(cardId)}/payments`,
      { params }
    );

    return response.data;
  },

  // Get credit card spending summary
  getSummary: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/summary`, { params });
    return response.data;
  },
};

export default creditCardService;