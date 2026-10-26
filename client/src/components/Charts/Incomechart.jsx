
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function IncomeChart({
  transactions = [],
  loading = false,
}) {
  const chartData = useMemo(() => {
    const grouped = {};

    transactions.forEach((item) => {
      if (String(item.type).toLowerCase() !== "income") return;

      const date = normalizeDate(
        item.date || item.createdAt || item.created_at
      );

      if (!date) return;

      grouped[date] =
        (grouped[date] || 0) + (Number(item.amount) || 0);
    });

    return Object.entries(grouped)
      .map(([date, amount]) => ({
        date,
        amount,
        day: new Date(`${date}T12:00:00`).toLocaleDateString(
          "en-IN",
          { day: "numeric", month: "short" }
        ),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
  }, [transactions]);

  const totalIncome = chartData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const averageIncome =
    chartData.length > 0 ? totalIncome / chartData.length : 0;

  const hasData = chartData.some((item) => item.amount > 0);

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Income Trend
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track your earnings over time
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50/80 p-3.5">
          <p className="text-xs font-medium text-emerald-700">
            Total income
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-800">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3.5">
          <p className="text-xs font-medium text-slate-500">
            Average per active day
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(averageIncome)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        </div>
      ) : !hasData ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <TrendingUp size={30} className="text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No income transactions found
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Add an income transaction to see your earnings trend.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
                dy={10}
              />

              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "#64748B", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />

              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Income",
                ]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date || ""
                }
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                  fontSize: 12,
                }}
              />

              <Line
                type="monotone"
                dataKey="amount"
                name="Income"
                stroke="#16A34A"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: "#16A34A",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "#16A34A",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
