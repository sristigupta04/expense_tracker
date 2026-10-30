
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
  }).format(Number(value) || 0);

function getMonthKey(value) {
  if (!value) return null;

  // YYYY-MM format ko directly handle karo.
  if (typeof value === "string") {
    const monthOnly = value.match(/^(\d{4})-(\d{2})$/);

    if (monthOnly) {
      const month = Number(monthOnly[2]);
      return month >= 1 && month <= 12 ? value : null;
    }

    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnly) {
      const month = Number(dateOnly[2]);
      const day = Number(dateOnly[3]);

      if (month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
      }

      return `${dateOnly[1]}-${dateOnly[2]}`;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

function normalizeAmount(value) {
  const amount = Number(value);

  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export default function MonthlyChart({
  transactions = [],
  data,
  loading = false,
}) {
  const chartData = useMemo(() => {
    const grouped = {};

    // Pre-aggregated data:
    // [{ month: "2026-01", income: 30000, expense: 12000 }]
    if (Array.isArray(data)) {
      data.forEach((item) => {
        const monthKey = getMonthKey(item?.month || item?.date);

        if (!monthKey) return;

        if (!grouped[monthKey]) {
          grouped[monthKey] = {
            monthKey,
            income: 0,
            expense: 0,
          };
        }

        grouped[monthKey].income += normalizeAmount(item?.income);
        grouped[monthKey].expense += normalizeAmount(item?.expense);
      });
    } else {
      const source = Array.isArray(transactions) ? transactions : [];

      source.forEach((item) => {
        const type = String(item?.type || "").toLowerCase();

        if (type !== "income" && type !== "expense") return;

        const monthKey = getMonthKey(
          item?.date || item?.createdAt || item?.created_at
        );

        if (!monthKey) return;

        if (!grouped[monthKey]) {
          grouped[monthKey] = {
            monthKey,
            income: 0,
            expense: 0,
          };
        }

        const amount = normalizeAmount(item?.amount);

        if (type === "income") {
          grouped[monthKey].income += amount;
        } else {
          grouped[monthKey].expense += amount;
        }
      });
    }

    return Object.values(grouped)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-6)
      .map((item) => ({
        ...item,
        month: formatMonth(item.monthKey),
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
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
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

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
      ) : (
        <>
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

          {!hasData ? (
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
                      formatCurrency(value),
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
        </>
      )}
    </section>
  );
}
