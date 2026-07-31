import {
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
    <div>
      <h2>Daily Chart</h2>

      <BarChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="date" />

        <YAxis />

        <Tooltip />

        <Legend />

        <Bar dataKey="amount" fill="#8884d8" />
      </BarChart>
    </div>
  );
}