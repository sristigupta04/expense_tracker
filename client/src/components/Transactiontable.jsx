import React, { useState } from "react";
import TransactionTable from "./TransactionTable";

function App() {
  const initials = [
    {
      id: 1,
      title: "Salary",
      amount: 5000,
      category: "Income",
      type: "Credit",
      date: "2023-01-01",
    },
  ];

  const [transactions, setTransactions] = useState(initials);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    type: "",
    date: "",
  });

  // Input Change
  const handle = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const newTransaction = {
      id: Date.now(),
      title: form.title,
      amount: form.amount,
      category: form.category,
      type: form.type,
      date: form.date,
    };

    setTransactions([...transactions, newTransaction]);

    // Clear Form
    setForm({
      title: "",
      amount: "",
      category: "",
      type: "",
      date: "",
    });
  };

  // Delete
  const remove = (id) => {
    const removeItem = transactions.filter((item) => item.id !== id);
    setTransactions(removeItem);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Enter Title"
          value={form.title}
          onChange={handle}
        />

        <input
          type="number"
          name="amount"
          placeholder="Enter Amount"
          value={form.amount}
          onChange={handle}
        />

        <input
          type="text"
          name="category"
          placeholder="Enter Category"
          value={form.category}
          onChange={handle}
        />

        <input
          type="text"
          name="type"
          placeholder="Enter Type"
          value={form.type}
          onChange={handle}
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handle}
        />

        <button type="submit">Add Transaction</button>
      </form>

      <TransactionTable
        transactions={transactions}
        remove={remove}
      />
    </>
  );
}

export default App;