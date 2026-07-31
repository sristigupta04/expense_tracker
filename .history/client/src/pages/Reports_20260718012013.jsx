import { useState } from "react";

import {
  getTotalIncome,
  getTotalExpense,
  getBalance,
  getCategoryReport,
  getMonthlyReport,
} from "../services/report";
import formatDate from "../utils/formatDate";
import formatCurrency from "../utils/formatCurrency";

export default function Reports() {
  const [transactions] = useState([
    {
      id: 1,
      title: "Salary",
      category: "Salary",
      amount: 30000,
      type: "income",
      date: "2026-07-01",
    },
    {
      id: 2,
      title: "Food",
      category: "Food",
      amount: 500,
      type: "expense",
      date: "2026-07-03",
    },
    {
      id: 3,
      title: "Shopping",
      category: "Shopping",
      amount: 1000,
      type: "expense",
      date: "2026-07-04",
    },
  ]);

  const income = getTotalIncome(transactions);
  const expense = getTotalExpense(transactions);
  const balance = getBalance(transactions);

  const categoryReport = getCategoryReport(transactions);
  const monthlyReport = getMonthlyReport(transactions);

  return (
    <div>
      <h1>Reports</h1>

      <h2>Income : {formatCurrency(income)}</h2>
      <h2>Expense : {formatCurrency(expense)}</h2>
      <h2>Balance : {formatCurrency(balance)}</h2>

      <hr />

      <h3>Category Report</h3>

      {Object.entries(categoryReport).map(([category, amount]) => (
        <p key={category}>
          {category} : {formatCurrency(amount)}
        </p>
      ))}

      <hr />

      <h3>Monthly Report</h3>

      {Object.entries(monthlyReport).map(([month, amount]) => (
        <p key={month}>
          {month} : {formatCurrency(amount)}
        </p>
      ))}
    </div>
  );
}