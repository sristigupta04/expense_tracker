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
    <div>
      <h1>Transactions</h1>

      <TransactionForm
        addTransaction={addTransaction}
      />

      <TransactionTable
        transactions={transactions}
        deleteTransaction={deleteTransaction}
        editTransaction={editTransaction}
      />
    </div>
  );
}