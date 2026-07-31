import { useState } from "react";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";

export default function Transactions() {
  const [transactions, setTransactions] = useState([
  ]);

  function addTransaction(transaction) {
    setTransactions((prev) => [...prev, transaction]);
  }

  function deleteTransaction(id) {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    );
  }

  function editTransaction(id, updatedTransaction) {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? { ...transaction, ...updatedTransaction }
          : transaction
      )
    );
  }

  return (
  <div className="min-h-screen bg-slate-100 p-6">

    <div className="mx-auto max-w-7xl">

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-slate-800">
          Transactions
        </h1>

        <p className="mt-2 text-slate-500">
          Add, edit and manage your transactions.
        </p>

      </div>

      <div className="mb-8 rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-6 text-2xl font-semibold">
          Add Transaction
        </h2>

        <TransactionForm
          addTransaction={addTransaction}
        />

      </div>

      <div className="rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-6 text-2xl font-semibold">
          Transaction History
        </h2>

        <TransactionTable
          transactions={transactions}
          deleteTransaction={deleteTransaction}
          editTransaction={editTransaction}
        />

      </div>

    </div>

  </div>
);
}