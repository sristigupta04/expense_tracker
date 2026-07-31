import { useExpense } from "../context/ExpenseContext";

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
  const { transactions } = useExpense();

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

      <hr />

      <h3>All Transactions</h3>

      {transactions.map((item) => (
        <div key={item.id}>
          <p>Title : {item.title}</p>
          <p>Date : {formatDate(item.date)}</p>
          <p>Amount : {formatCurrency(item.amount)}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}