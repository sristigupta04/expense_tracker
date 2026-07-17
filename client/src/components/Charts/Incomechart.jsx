import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

function IncomeChart({ transactions }) {
  // Sirf income transactions
  const income = transactions.filter(
    (item) => item.type === "income"
  );

  // Same date ki income ko add karo
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
  );
}

export default IncomeChart;