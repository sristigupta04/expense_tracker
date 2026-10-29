import { useCallback, useEffect, useState } from "react";
import transactionApi from "../services/transactionApi";

export default function useExpense({ autoFetch = true } = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch transactions
  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const result = await transactionApi.getAll(params);

      const list =
        result?.transactions ??
        result?.data?.transactions ??
        result?.data ??
        result;

      if (!Array.isArray(list)) {
        throw new Error("Invalid transactions response.");
      }

      setTransactions(list);
      return list;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load transactions."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add transaction
  const createTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    setError("");

    try {
      const result = await transactionApi.create(transactionData);
      await fetchTransactions();

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create transaction."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  // Update transaction
  const updateTransaction = useCallback(async (id, transactionData) => {
    setLoading(true);
    setError("");

    try {
      const result = await transactionApi.update(id, transactionData);
      await fetchTransactions();

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update transaction."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  // Delete transaction
  const deleteTransaction = useCallback(async (id) => {
    setLoading(true);
    setError("");

    try {
      const result = await transactionApi.remove(id);

      setTransactions((previous) =>
        previous.filter(
          (transaction) => String(transaction.id) !== String(id)
        )
      );

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete transaction."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!autoFetch) return;

    fetchTransactions().catch(() => {});
  }, [autoFetch, fetchTransactions]);

  return {
    transactions,
    setTransactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}