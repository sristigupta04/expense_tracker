import { useCallback, useEffect, useState } from "react";
import bankTransactionService from "../services/bankTransactionService";

export default function useBankTransaction({
  autoFetch = true,
  initialFilters = {},
} = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  // Fetch bank transactions
  const fetchTransactions = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError("");

      try {
        const result = await bankTransactionService.getAll({
          ...filters,
          ...params,
        });

        const transactionList =
          result?.transactions ??
          result?.data?.transactions ??
          result?.data ??
          result;

        if (!Array.isArray(transactionList)) {
          throw new Error("Invalid bank transactions response.");
        }

        setTransactions(transactionList);
        return transactionList;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load bank transactions."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Create bank transaction
  const createTransaction = useCallback(
    async (transactionData) => {
      setLoading(true);
      setError("");

      try {
        const result =
          await bankTransactionService.create(transactionData);

        await fetchTransactions();
        return result;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to create bank transaction."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTransactions]
  );

  // Update bank transaction
  const updateTransaction = useCallback(
    async (id, transactionData) => {
      setLoading(true);
      setError("");

      try {
        const result =
          await bankTransactionService.update(id, transactionData);

        await fetchTransactions();
        return result;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to update bank transaction."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTransactions]
  );

  // Delete bank transaction
  const deleteTransaction = useCallback(
    async (id) => {
      setLoading(true);
      setError("");

      try {
        const result = await bankTransactionService.remove(id);

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
            "Failed to delete bank transaction."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get transactions for a specific bank account
  const fetchByAccount = useCallback(
    async (accountId, params = {}) => {
      setLoading(true);
      setError("");

      try {
        const result = await bankTransactionService.getByAccount(
          accountId,
          params
        );

        const transactionList =
          result?.transactions ??
          result?.data?.transactions ??
          result?.data ??
          result;

        if (!Array.isArray(transactionList)) {
          throw new Error("Invalid account transactions response.");
        }

        setTransactions(transactionList);
        return transactionList;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load account transactions."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((previous) => ({
      ...previous,
      ...newFilters,
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    if (!autoFetch) return;

    fetchTransactions().catch(() => {
      // Error is stored in state.
    });
  }, [autoFetch, fetchTransactions]);

  return {
    transactions,
    setTransactions,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    resetFilters,
    fetchTransactions,
    fetchByAccount,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}