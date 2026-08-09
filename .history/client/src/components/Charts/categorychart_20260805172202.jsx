import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function CategoryChart({ transactions = [] }) {
  // Only expense transactions
  const expenseTransactions = transactions.filter(
    (item) => item.type === "expense"
  );

  const chartData = expenseTransactions.reduce((acc, item) => {
    const found = acc.find(
      (i) => i.category === item.category
    );

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
        Category Wise Expense
      </h2>

      <div className="h-80">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            No expense data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={4}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}