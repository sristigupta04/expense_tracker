import { Wallet, TrendingUp } from "lucide-react";

export default function AccountBalanceCard({
  title = "Account Balance",
  balance = 0,
  currency = "INR",
  description = "Current account balance",
}) {
  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(balance) || 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-3 break-words text-2xl font-bold text-slate-900">
            {formattedBalance}
          </h3>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
          <Wallet size={23} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <TrendingUp size={15} />
        <span>{description}</span>
      </div>
    </div>
  );
}