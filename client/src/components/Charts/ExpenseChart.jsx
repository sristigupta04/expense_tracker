
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown } from "lucide-react";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

function getDateKey(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ExpenseChart({
  transactions = [],
  data,
  loading = false,
}) {
  const chartData = useMemo(() => {
    // Optional pre-aggregated data format:
    // [{ date: "2026-10-01", amount: 500 }]
    if (Array.isArray(data)) {
      return data
        .map((item) => ({
          date: getDateKey(item.date),
          amount: Number(item.amount ?? item.expense) || 0,
        }))
        .filter((item) => item.date)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30)
        .map((item) => ({
          ...item,
          day: new Date(`${item.date}T12:00:00`).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "short" }
          ),
        }));
    }

    const grouped = {};

    transactions.forEach((transaction) => {
      if (String(transaction.type).toLowerCase() !== "expense") {
        return;
      }

      const date = getDateKey(
        transaction.date ||
          transaction.createdAt ||
          transaction.created_at
      );

      if (!date) return;

      grouped[date] =
        (grouped[date] || 0) + (Number(transaction.amount) || 0);
    });

    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map((item) => ({
        ...item,
        day: new Date(`${item.date}T12:00:00`).toLocaleDateString(
          "en-IN",
          { day: "numeric", month: "short" }
        ),
      }));
  }, [transactions, data]);

  const totalExpense = chartData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const averageExpense =
    chartData.length > 0 ? totalExpense / chartData.length : 0;

  const hasData = chartData.some((item) => item.amount > 0);

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Expense Overview
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Your spending trend across the latest 30 active dates
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
          <TrendingDown size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3.5">
          <p className="text-xs font-medium text-slate-500">
            Total expenses
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {currency(totalExpense)}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3.5">
          <p className="text-xs font-medium text-blue-700">
            Average per active day
          </p>
          <p className="mt-1 text-xl font-bold text-blue-800">
            {currency(averageExpense)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
      ) : !hasData ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <TrendingDown size={30} className="text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No expenses to display
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Your expense trend will appear after you add transactions.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="expenseAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#2563EB"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="#2563EB"
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>

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
                tickFormatter={currency}
                tick={{ fill: "#64748B", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />

              <Tooltip
                formatter={(value) => [
                  currency(Number(value)),
                  "Expenses",
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

              <Area
                type="monotone"
                dataKey="amount"
                name="Expenses"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#expenseAreaGradient)"
                activeDot={{
                  r: 5,
                  fill: "#2563EB",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
