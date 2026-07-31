import {
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
    <div>
      <h2>Income Chart</h2>

      <LineChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="date" />

        <YAxis />

        <Tooltip />

        <Legend />

        <Line
          type="monotone"
          dataKey="amount"
          stroke="#8884d8"
        />
      </LineChart>
    </div>
  );
}