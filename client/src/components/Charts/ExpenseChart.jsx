import React from "react";

export default function ExpenseChart({ transactions = [] }) {
  const expenses = transactions.filter(
    (transaction) => transaction.type === "expense"
  );

  const totalExpense = expenses.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Expense Summary</h2>

      <p className="text-gray-700">
        Total Expense:
        <span className="text-red-600 font-semibold ml-2">
          ₹{totalExpense}
        </span>
      </p>

      <div className="mt-4">
        {expenses.length === 0 ? (
          <p className="text-gray-500">No expense transactions found.</p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((transaction) => (
              <li
                key={transaction.id}
                className="flex justify-between border-b pb-2"
              >
                <span>{transaction.title}</span>
                <span className="text-red-500">
                  ₹{transaction.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}