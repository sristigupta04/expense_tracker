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

export default function ExpenseChart({ transactions = [] }) {
  const expenseTransactions = transactions.filter(
    (item) => item.type === "expense"
  );

  const chartData = expenseTransactions.reduce((acc, item) => {
    const found = acc.find((i) => i.category === item.category);

    if (found) {
      found.amount += Number(item.amount);
    } else {
      acc.push({
        category: item.category,
        amount: Number(item.amount),
      });
    }

    return acc;
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-xl font-bold text-slate-800">
        Expense Analysis
      </h2>

      <div className="h-80">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            No expense transactions found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="category" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="amount"
                name="Expense"
                fill="#ef4444"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}