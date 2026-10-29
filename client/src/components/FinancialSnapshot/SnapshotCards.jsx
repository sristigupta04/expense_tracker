
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

function SummaryCard({ title, value, description, icon: Icon, tone }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-rose-50 text-rose-700 ring-rose-100",
    blue: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
  };

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {currency(value)}
          </p>
        </div>

        <div className={`shrink-0 rounded-xl p-3 ring-1 ${tones[tone]}`}>
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
  const positiveBalance = balance >= 0;
  const savingsDescription =
    income > 0
      ? `${Math.max(0, savingsRate).toFixed(1)}% of this month's income remains after expenses when positive.`
      : "Add income transactions to calculate your savings rate.";

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Income"
        value={income}
        description="Income recorded this month"
        icon={ArrowDownRight}
        tone="green"
      />

      <SummaryCard
        title="Total Expenses"
        value={expense}
        description="Spending recorded this month"
        icon={ArrowUpRight}
        tone="red"
      />

      <SummaryCard
        title="Net Balance"
        value={balance}
        description={
          positiveBalance
            ? "Income minus expenses this month"
            : "Expenses are higher than income this month"
        }
        icon={Wallet}
        tone="blue"
      />

      <SummaryCard
        title="Savings Rate"
        value={`${Math.max(0, savingsRate).toFixed(1)}%`}
        description={savingsDescription}
        icon={PiggyBank}
        tone="violet"
      />
    </div>
  );
}
