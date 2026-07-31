import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function IncomeChart({ transactions }) {
  const income = transactions.filter(
    (item) => item.type === "income"
  );

  const chartData = income.reduce((acc, item) => {
    const found = acc.find((i) => i.date === item.date);

    if (found) {
      found.amount += Number(item.amount);
    } else {
      acc.push({
        date: item.date,
        amount: Number(item.amount),
      });
    }

    return acc;
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">

      <h2 className="mb-6 text-xl font-bold text-slate-800">
        Income Trend
      </h2>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="amount"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}