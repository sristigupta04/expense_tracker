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

export default function DailyChart({ transactions }) {
  const data = transactions.reduce((acc, item) => {
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
        Daily Expense
      </h2>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="amount"
              fill="#3B82F6"
              radius={[8, 8, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}