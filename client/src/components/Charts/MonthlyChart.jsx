
import { useMemo } from "react";
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
import { CalendarRange } from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

function getMonthKey(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

export default function MonthlyChart({
  transactions = [],
  data,
  loading = false,
}) {
  const chartData = useMemo(() => {
    // Optional pre-aggregated format:
    // [{ month: "2026-01", income: 30000, expense: 12000 }]
    if (Array.isArray(data)) {
      return data
        .map((item) => {
          const month = item.month || item.date;
          const key = getMonthKey(
            month && /^\d{4}-\d{2}$/.test(month)
              ? `${month}-01`
              : month
          );

          return {
            monthKey: key,
            income: Number(item.income) || 0,
            expense: Number(item.expense) || 0,
          };
        })
        .filter((item) => item.monthKey)
        .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
        .slice(-6)
        .map((item) => ({
          ...item,
          month: new Date(
            `${item.monthKey}-01T12:00:00`
          ).toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          }),
          savings: item.income - item.expense,
        }));
    }

    const grouped = {};

    transactions.forEach((item) => {
      const type = String(item.type || "").toLowerCase();

      if (type !== "income" && type !== "expense") return;

      const monthKey = getMonthKey(
        item.date || item.createdAt || item.created_at
      );

      if (!monthKey) return;

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          monthKey,
          income: 0,
          expense: 0,
        };
      }

      const amount = Number(item.amount) || 0;

      if (type === "income") {
        grouped[monthKey].income += amount;
      } else {
        grouped[monthKey].expense += amount;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-6)
      .map((item) => ({
        ...item,
        month: new Date(
          `${item.monthKey}-01T12:00:00`
        ).toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        savings: item.income - item.expense,
      }));
  }, [transactions, data]);

  const totalIncome = chartData.reduce(
    (sum, item) => sum + item.income,
    0
  );

  const totalExpense = chartData.reduce(
    (sum, item) => sum + item.expense,
    0
  );

  const netSavings = totalIncome - totalExpense;

  const hasData = chartData.some(
    (item) => item.income > 0 || item.expense > 0
  );

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Monthly Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Compare income and expenses over the last six active months
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
          <CalendarRange size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-emerald-50 p-3.5">
          <p className="text-xs font-medium text-emerald-700">
            Total income
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-800">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="rounded-xl bg-red-50 p-3.5">
          <p className="text-xs font-medium text-red-700">
            Total expenses
          </p>
          <p className="mt-1 text-lg font-bold text-red-800">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3.5">
          <p className="text-xs font-medium text-blue-700">
            Net savings
          </p>
          <p
            className={`mt-1 text-lg font-bold ${
              netSavings >= 0 ? "text-blue-800" : "text-red-700"
            }`}
          >
            {formatCurrency(netSavings)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
      ) : !hasData ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <CalendarRange size={30} className="text-slate-300" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            No monthly data available
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Add income and expenses to compare your monthly finances.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              barGap={5}
            >
              <CartesianGrid
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
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
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  name,
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                  fontSize: 12,
                }}
              />

              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: 12,
                  paddingTop: 16,
                }}
              />

              <Bar
                dataKey="income"
                name="Income"
                fill="#16A34A"
                radius={[5, 5, 0, 0]}
                maxBarSize={32}
              />

              <Bar
                dataKey="expense"
                name="Expenses"
                fill="#2563EB"
                radius={[5, 5, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
