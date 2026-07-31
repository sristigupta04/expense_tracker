import { useState } from "react";

export default function Transactions() {

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      title: "Salary",
      category: "Salary",
      amount: 30000,
      type: "income",
      date: "2026-07-01"
    },
    {
      id: 2,
      title: "Food",
      category: "Food",
      amount: 500,
      type: "expense",
      date: "2026-07-03"
    }
  ]);

  function handleSubmit(e) {
    e.preventDefault();

    const title = e.target.title.value;
    const category = e.target.category.value;
    const amount = Number(e.target.amount.value);
    const type = e.target.type.value;
    const date = e.target.date.value;

    const transaction = {
      id: transactions.length + 1,
      title,
      category,
      amount,
      type,
      date
    };

    addTransaction(transaction);

    e.target.reset();
  }

  function addTransaction(transaction) {
    setTransactions([...transactions, transaction]);
  }

  function deleteTransaction(id) {
    setTransactions(
      transactions.filter((transaction) => transaction.id !== id)
    );
  }

  function editTransaction(id) {

    const newTitle = prompt("Enter New Title");
    const newCategory = prompt("Enter New Category");
    const newAmount = Number(prompt("Enter New Amount"));
    const newType = prompt("Enter New Type");
    const newDate = prompt("Enter New Date");

    setTransactions(
      transactions.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              title: newTitle,
              category: newCategory,
              amount: newAmount,
              type: newType,
              date: newDate
            }
          : transaction
      )
    );
  }

  return (
    <div>

      <h1>Transactions</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Title"
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
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

        <input
          type="date"
          name="date"
        />

        <button type="submit">
          Add Transaction
        </button>

      </form>

      <hr />

      <h2>Transaction List</h2>

      {transactions.map((transaction) => (

        <div key={transaction.id}>

          <h3>{transaction.title}</h3>

          <p>Category : {transaction.category}</p>

          <p>Amount : ₹{transaction.amount}</p>

          <p>Type : {transaction.type}</p>

          <p>Date : {transaction.date}</p>

          <button
            onClick={() => editTransaction(transaction.id)}
          >
            Edit
          </button>

          <button
            onClick={() => deleteTransaction(transaction.id)}
          >
            Delete
          </button>

          <hr />

        </div>

      ))}

    </div>
  );
}