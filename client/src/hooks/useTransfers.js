import { useCallback, useEffect, useState } from "react";
import transferService from "../services/transferService";

export default function useTransfer({ autoFetch = true } = {}) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all transfers
  const fetchTransfers = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const result = await transferService.getAll(params);

      const list =
        result?.transfers ??
        result?.data?.transfers ??
        result?.data ??
        result;

      if (!Array.isArray(list)) {
        throw new Error("Invalid transfers response.");
      }

      setTransfers(list);
      return list;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load transfers."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a transfer
  const createTransfer = useCallback(async (transferData) => {
    setLoading(true);
    setError("");

    try {
      const result = await transferService.create(transferData);

      const newTransfer =
        result?.transfer ??
        result?.data?.transfer ??
        result?.data ??
        result;

      if (newTransfer && typeof newTransfer === "object") {
        setTransfers((previous) => [
          newTransfer,
          ...previous.filter(
            (item) => String(item.id) !== String(newTransfer.id)
          ),
        ]);
      }

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create transfer."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transfers for one account
  const fetchTransfersByAccount = useCallback(
    async (accountId, params = {}) => {
      setLoading(true);
      setError("");

      try {
        const result = await transferService.getByAccount(
          accountId,
          params
        );

        const list =
          result?.transfers ??
          result?.data?.transfers ??
          result?.data ??
          result;

        if (!Array.isArray(list)) {
          throw new Error("Invalid account transfers response.");
        }

        setTransfers(list);
        return list;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load account transfers."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Cancel a pending transfer
  const cancelTransfer = useCallback(async (transferId) => {
    setLoading(true);
    setError("");

    try {
      const result = await transferService.cancel(transferId);

      // Refresh from the server to get the authoritative status.
      const refreshed = await transferService.getAll();

      const list =
        refreshed?.transfers ??
        refreshed?.data?.transfers ??
        refreshed?.data ??
        refreshed;

      if (Array.isArray(list)) {
        setTransfers(list);
      }

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to cancel transfer."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get one transfer's details
  const fetchTransferById = useCallback(async (transferId) => {
    setError("");

    try {
      return await transferService.getById(transferId);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load transfer details."
      );
      throw err;
    }
  }, []);

  // Refresh transfers
  const refreshTransfers = useCallback(
    (params = {}) => fetchTransfers(params),
    [fetchTransfers]
  );

  // Initial fetch
  useEffect(() => {
    if (!autoFetch) return;

    fetchTransfers().catch(() => {
      // Error is already stored in state.
    });
  }, [autoFetch, fetchTransfers]);

  return {
    transfers,
    setTransfers,
    loading,
    error,
    fetchTransfers,
    fetchTransfersByAccount,
    createTransfer,
    cancelTransfer,
    fetchTransferById,
    refreshTransfers,
  };
}