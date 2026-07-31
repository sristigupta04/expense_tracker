import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTransactions() {
    try {
      const { data } = await api.get("/transactions");
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function addExpense(transaction) {
    try {
      const { data } = await api.post(
        "/transactions",
        transaction
      );

      setTransactions((prev) => [
        ...prev,
        data,
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  async function removeExpense(id) {
    try {
      await api.delete(`/transactions/${id}`);

      setTransactions((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function updateExpense(id, transaction) {
    try {
      const { data } = await api.put(
        `/transactions/${id}`,
        transaction
      );

      setTransactions((prev) =>
        prev.map((item) =>
          item._id === id ? data : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        loading,
        addExpense,
        removeExpense,
        updateExpense,
        fetchTransactions,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  return useContext(ExpenseContext);
}