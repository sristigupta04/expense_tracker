
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-rose-50 text-rose-700 ring-rose-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
  };

  return (
    <article className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105 ${
            tones[tone] || tones.blue
          }`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

export default function SnapshotCards({
  income = 0,
  expense = 0,
  balance = 0,
  savingsRate = 0,
}) {
  const safeIncome = Number(income) || 0;
  const safeExpense = Number(expense) || 0;
  const safeBalance = Number(balance) || 0;
  const safeSavingsRate = Number(savingsRate) || 0;

  const positiveBalance = safeBalance >= 0;

  const savingsDescription =
    safeIncome > 0
      ? safeBalance >= 0
        ? `${safeSavingsRate.toFixed(1)}% of this month's income remains after expenses.`
        : "Your expenses exceed your recorded income this month."
      : "Add income transactions to calculate your savings rate.";

  const savingsTone =
    safeIncome <= 0
      ? "violet"
      : safeSavingsRate >= 20
        ? "green"
        : safeSavingsRate >= 0
          ? "violet"
          : "red";

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Income"
        value={currency(safeIncome)}
        description="Income recorded this month"
        icon={ArrowDownRight}
        tone="green"
      />

      <SummaryCard
        title="Total Expenses"
        value={currency(safeExpense)}
        description="Spending recorded this month"
        icon={ArrowUpRight}
        tone="red"
      />

      <SummaryCard
        title="Net Balance"
        value={currency(safeBalance)}
        description={
          positiveBalance
            ? "Income minus expenses this month"
            : "Expenses are higher than income this month"
        }
        icon={Wallet}
        tone={positiveBalance ? "blue" : "red"}
      />

      <SummaryCard
        title="Savings Rate"
        value={`${safeSavingsRate.toFixed(1)}%`}
        description={savingsDescription}
        icon={safeSavingsRate >= 20 ? TrendingUp : PiggyBank}
        tone={savingsTone}
      />
    </div>
  );
}
