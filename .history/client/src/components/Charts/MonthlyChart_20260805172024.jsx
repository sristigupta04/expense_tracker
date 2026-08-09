import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function MonthlyChart({ transactions = [] }) {
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleString("default", {
      month: "short",
    });

    let found = acc.find((item) => item.month === month);

    if (!found) {
      found = {
        month,
        income: 0,
        expense: 0,
      };
      acc.push(found);
    }

    if (transaction.type === "income") {
      found.income += Number(transaction.amount);
    } else {
      found.expense += Number(transaction.amount);
    }

    return acc;
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">
        Monthly Overview
      </h2>

      {monthlyData.length === 0 ? (
        <p className="text-gray-500">
          No transactions available.
        </p>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="income"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
              />

              <Bar
                dataKey="expense"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}