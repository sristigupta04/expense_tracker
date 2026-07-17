import { useState } from "react";
import formatCurrency from "../utils/formatCurrency";

export default function Dashboard() {

  const [balance, setBalance] = useState(25000);
  const [income, setIncome] = useState(40000);
  const [expense, setExpense] = useState(15000);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      title: "Salary",
      amount: 30000,
      type: "income"
    },
    {
      id: 2,
      title: "Food",
      amount: 500,
      type: "expense"
    }
  ]);

  // Add Form
  function handleSubmit(e) {
    e.preventDefault();
          <h2>{formatCurrency(balance)}</h2>

    const title = e.target.title.value;
    const amount = Number(e.target.amount.value);
    const type = e.target.type.value;

    const transaction = {
      id: transactions.length + 1,
      title,
      amount,
      type
    };

    addTransaction(transaction);

    e.target.reset();
  }

  // Add Transaction
  function addTransaction(transaction) {

    setTransactions([...transactions, transaction]);

    if (transaction.type === "income") {
      setIncome(income + transaction.amount);
      setBalance(balance + transaction.amount);
    }

    if (transaction.type === "expense") {
      setExpense(expense + transaction.amount);
      setBalance(balance - transaction.amount);
    }
  }

  // Delete Transaction
  function deleteTransaction(id) {

    const transaction = transactions.find(
      (t) => t.id === id
    );

    setTransactions(
      transactions.filter((t) => t.id !== id)
    );

    if (transaction.type === "income") {
      setIncome(income - transaction.amount);
      setBalance(balance - transaction.amount);
    }

    if (transaction.type === "expense") {
      setExpense(expense - transaction.amount);
      setBalance(balance + transaction.amount);
    }
  }

  // Edit Transaction
  function editTransaction(id) {

    const newTitle = prompt("Enter new title");

    const newAmount = Number(prompt("Enter new amount"));

    setTransactions(
      transactions.map((t) =>
        t.id === id
          ? {
              ...t,
              title: newTitle,
              amount: newAmount
            }
          : t
      )
    );
  }

  return (
    <>
      <h1>Dashboard</h1>

      <h2>Balance : ₹{balance}</h2>
      <h2>Income : ₹{income}</h2>
      <h2>Expense : ₹{expense}</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Title"
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
        />

        <select name="type">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <button type="submit">
          Add Transaction
        </button>

      </form>

      <hr />

      {transactions.map((transaction) => (

        <div key={transaction.id}>

          <h3>{transaction.title}</h3>

          <p>
            ₹{transaction.amount} ({transaction.type})
          </p>

          <button
            onClick={() =>
              editTransaction(transaction.id)
            }
          >
            Edit
          </button>

          <button
            onClick={() =>
              deleteTransaction(transaction.id)
            }
          >
            Delete
          </button>

          <hr />

        </div>

      ))}

    </>
  );
}