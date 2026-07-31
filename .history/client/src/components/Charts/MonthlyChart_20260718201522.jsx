import React from "react";

export default function MonthlyChart({ transactions = [] }) {
  const monthlyData = {};

  transactions.forEach((transaction) => {
    const month = new Date(transaction.date).toLocaleString("default", {
      month: "short",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }

    monthlyData[month] += Number(transaction.amount);
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Monthly Transactions</h2>

      {Object.keys(monthlyData).length === 0 ? (
        <p className="text-gray-500">No transactions available.</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(monthlyData).map(([month, total]) => (
            <div
              key={month}
              className="flex justify-between border-b pb-2"
            >
              <span>{month}</span>
              <span className="font-semibold">₹{total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}