import { useState } from "react";

export default function Reports() {

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
    },
    {
      id: 3,
      title: "Shopping",
      category: "Shopping",
      amount: 1000,
      type: "expense",
      date: "2026-07-04"
    }
  ]);

  function calculateIncome() {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
  }

  function calculateExpense() {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
  }

  function calculateBalance() {
    return calculateIncome() - calculateExpense();
  }

  function categoryWiseReport(category) {
    return transactions
      .filter((t) => t.category === category)
      .reduce((acc, t) => acc + t.amount, 0);
  }

  function monthlyReport(month) {
    return transactions
      .filter((t) => t.date.slice(5, 7) === month)
      .reduce((acc, t) => acc + t.amount, 0);
  }

  return (
    <div>

      <h1>Reports</h1>

      <h2>Income : ₹{calculateIncome()}</h2>

      <h2>Expense : ₹{calculateExpense()}</h2>

      <h2>Balance : ₹{calculateBalance()}</h2>

      <hr />

      <h3>Category Report</h3>

      <p>Food : ₹{categoryWiseReport("Food")}</p>

      <p>Shopping : ₹{categoryWiseReport("Shopping")}</p>

      <p>Salary : ₹{categoryWiseReport("Salary")}</p>

      <hr />

      <h3>Monthly Report</h3>

      <p>July : ₹{monthlyReport("07")}</p>

    </div>
  );
}