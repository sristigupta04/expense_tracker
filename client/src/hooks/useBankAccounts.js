import { useCallback, useEffect, useState } from "react";
import bankAccountService from "../services/bankAccountService";

export default function useBankAccount({ autoFetch = true } = {}) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all bank accounts
  const fetchAccounts = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const result = await bankAccountService.getAll(params);

      const accountList =
        result?.accounts ??
        result?.data?.accounts ??
        result?.data ??
        result;

      if (!Array.isArray(accountList)) {
        throw new Error("Invalid bank accounts response.");
      }

      setAccounts(accountList);
      return accountList;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load bank accounts.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a bank account
  const createAccount = useCallback(async (accountData) => {
    setLoading(true);
    setError("");

    try {
      const result = await bankAccountService.create(accountData);
      const newAccount =
        result?.account ?? result?.data?.account ?? result?.data ?? result;

      if (newAccount && typeof newAccount === "object") {
        setAccounts((previous) => {
          const exists = previous.some(
            (account) => String(account.id) === String(newAccount.id)
          );

          return exists ? previous : [newAccount, ...previous];
        });
      }

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create bank account."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a bank account
  const updateAccount = useCallback(async (id, accountData) => {
    setLoading(true);
    setError("");

    try {
      const result = await bankAccountService.update(id, accountData);
      const updatedAccount =
        result?.account ??
        result?.data?.account ??
        result?.data ??
        result;

      if (updatedAccount && typeof updatedAccount === "object") {
        setAccounts((previous) =>
          previous.map((account) =>
            String(account.id) === String(id)
              ? { ...account, ...updatedAccount }
              : account
          )
        );
      }

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update bank account."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a bank account
  const deleteAccount = useCallback(async (id) => {
    setLoading(true);
    setError("");

    try {
      const result = await bankAccountService.remove(id);

      setAccounts((previous) =>
        previous.filter((account) => String(account.id) !== String(id))
      );

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete bank account."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh one account's balance
  const refreshBalance = useCallback(async (id) => {
    setError("");

    try {
      const result = await bankAccountService.getBalance(id);
      const balanceData = result?.account ?? result?.data ?? result;

      const balance =
        balanceData?.currentBalance ??
        balanceData?.balance ??
        balanceData?.current_balance;

      if (balance !== undefined) {
        setAccounts((previous) =>
          previous.map((account) =>
            String(account.id) === String(id)
              ? { ...account, currentBalance: Number(balance) }
              : account
          )
        );
      }

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to refresh account balance."
      );
      throw err;
    }
  }, []);

  // Load accounts on mount
  useEffect(() => {
    if (!autoFetch) return;

    fetchAccounts().catch(() => {
      // Error is already stored in state.
    });
  }, [autoFetch, fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    setAccounts,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshBalance,
  };
}