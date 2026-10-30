
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default function AccountBalanceCard({
  title = "Account Balance",
  balance = 0,
  currency = "INR",
  description = "Current account balance",
  trend,
  icon: Icon = Wallet,
}) {
  const numericBalance = Number(balance);
  const safeBalance = Number.isFinite(numericBalance)
    ? numericBalance
    : 0;

  let formattedBalance;

  try {
    formattedBalance = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(safeBalance);
  } catch {
    formattedBalance = new Intl.NumberFormat("en-IN", {
      style: "decimal",
      maximumFractionDigits: 2,
    }).format(safeBalance);
  }

  const isNegative = safeBalance < 0;
  const TrendIcon =
    trend === "down" ? TrendingDown : TrendingUp;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3
            className={`mt-3 break-words text-2xl font-bold tracking-tight sm:text-3xl ${
              isNegative ? "text-red-600" : "text-slate-900"
            }`}
          >
            {formattedBalance}
          </h3>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon size={23} />
        </div>
      </div>

      <div className="mt-4 flex min-w-0 items-center gap-2 text-xs text-slate-500">
        {trend ? (
          <TrendIcon
            size={15}
            className={
              trend === "down" ? "text-red-500" : "text-emerald-600"
            }
          />
        ) : (
          <Wallet size={15} className="shrink-0 text-blue-600" />
        )}

        <span className="break-words">{description}</span>
      </div>
    </article>
  );
}
