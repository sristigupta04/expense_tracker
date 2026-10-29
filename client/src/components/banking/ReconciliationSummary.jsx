import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Clock,
  CircleDollarSign,
} from "lucide-react";

const formatCurrency = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  }
};

const getStatusConfig = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (["completed", "reconciled", "matched", "success"].includes(normalized)) {
    return {
      label: "Reconciled",
      icon: CheckCircle2,
      styles: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Reconciliation completed successfully",
    };
  }

  if (["in_progress", "in progress", "pending"].includes(normalized)) {
    return {
      label: "In Progress",
      icon: Clock,
      styles: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Some transactions still need review",
    };
  }

  if (["failed", "error"].includes(normalized)) {
    return {
      label: "Needs Attention",
      icon: XCircle,
      styles: "bg-rose-50 text-rose-700 border-rose-200",
      description: "Review discrepancies before completing",
    };
  }

  return {
    label: status || "Not Reconciled",
    icon: AlertTriangle,
    styles: "bg-slate-100 text-slate-700 border-slate-200",
    description: "Check the reconciliation results",
  };
};

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconStyles,
  valueStyles = "text-slate-900",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`mt-3 break-words text-2xl font-bold tracking-tight ${valueStyles}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
          )}
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyles}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function ReconciliationSummary({
  reconciliation = {},
  currency = "INR",
}) {
  const {
    status = "Not Reconciled",
    matchedCount = 0,
    unmatchedCount = 0,
    bankOnlyCount = 0,
    appOnlyCount = 0,
    totalBankTransactions = 0,
    totalAppTransactions = 0,
    bankTotal = 0,
    appTotal = 0,
    difference = 0,
  } = reconciliation;

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const totalMatched = Number(matchedCount || 0);
  const totalUnmatched = Number(unmatchedCount || 0);
  const totalBankOnly = Number(bankOnlyCount || 0);
  const totalAppOnly = Number(appOnlyCount || 0);

  const totalReviewed =
    totalMatched + totalUnmatched + totalBankOnly + totalAppOnly;

  const matchPercentage =
    totalReviewed > 0
      ? Math.round((totalMatched / totalReviewed) * 100)
      : 0;

  const differenceValue = Number(difference || 0);
  const hasDifference = Math.abs(differenceValue) > 0.009;

  return (
    <section className="space-y-5">
      {/* Reconciliation status */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Reconciliation Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Compare imported bank transactions with your app records.
              </p>
            </div>
          </div>

          <div className={`inline-flex w-fit items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold ${statusConfig.styles}`}>
            <StatusIcon size={17} />
            {statusConfig.label}
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <p className="text-sm text-slate-600">
            {statusConfig.description}
          </p>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-slate-500">
                Matched transactions
              </span>
              <span className="font-bold text-slate-800">
                {matchPercentage}%
              </span>
            </div>

            <div
              className="h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Transaction match percentage"
              aria-valuenow={matchPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction count cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Matched"
          value={totalMatched}
          subtitle="Transactions found in both records"
          icon={CheckCircle2}
          iconStyles="bg-emerald-50 text-emerald-700"
          valueStyles="text-emerald-700"
        />

        <SummaryCard
          title="Unmatched"
          value={totalUnmatched}
          subtitle="Transactions requiring review"
          icon={AlertTriangle}
          iconStyles="bg-amber-50 text-amber-700"
          valueStyles="text-amber-700"
        />

        <SummaryCard
          title="Bank Only"
          value={totalBankOnly}
          subtitle="Transactions missing from the app"
          icon={TrendingDown}
          iconStyles="bg-rose-50 text-rose-700"
          valueStyles="text-rose-700"
        />

        <SummaryCard
          title="App Only"
          value={totalAppOnly}
          subtitle="Transactions missing from the statement"
          icon={TrendingUp}
          iconStyles="bg-blue-50 text-blue-700"
          valueStyles="text-blue-700"
        />
      </div>

      {/* Amount comparison */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <CircleDollarSign size={20} className="text-blue-700" />
          <h3 className="font-bold text-slate-900">Amount Comparison</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Bank Statement Total"
            value={formatCurrency(bankTotal, currency)}
            subtitle={`${Number(totalBankTransactions || 0)} bank transactions`}
            icon={Wallet}
            iconStyles="bg-indigo-50 text-indigo-700"
          />

          <SummaryCard
            title="App Transactions Total"
            value={formatCurrency(appTotal, currency)}
            subtitle={`${Number(totalAppTransactions || 0)} app transactions`}
            icon={ArrowLeftRight}
            iconStyles="bg-blue-50 text-blue-700"
          />

          <SummaryCard
            title="Difference"
            value={formatCurrency(Math.abs(differenceValue), currency)}
            subtitle={
              hasDifference
                ? differenceValue > 0
                  ? "Bank total is higher than app total"
                  : "App total is higher than bank total"
                : "No difference in recorded totals"
            }
            icon={hasDifference ? AlertTriangle : CheckCircle2}
            iconStyles={
              hasDifference
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }
            valueStyles={
              hasDifference ? "text-amber-700" : "text-emerald-700"
            }
          />
        </div>
      </div>

      {/* Reconciliation result */}
      <div className={`flex items-start gap-3 rounded-2xl border p-4 ${
        hasDifference
          ? "border-amber-200 bg-amber-50"
          : "border-emerald-200 bg-emerald-50"
      }`}>
        {hasDifference ? (
          <AlertTriangle size={21} className="mt-0.5 shrink-0 text-amber-700" />
        ) : (
          <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-emerald-700" />
        )}

        <div>
          <p className={`font-semibold ${
            hasDifference ? "text-amber-900" : "text-emerald-900"
          }`}>
            {hasDifference
              ? "Differences detected"
              : "Totals are balanced"}
          </p>

          <p className={`mt-1 text-sm leading-6 ${
            hasDifference ? "text-amber-800" : "text-emerald-800"
          }`}>
            {hasDifference
              ? "Review unmatched transactions, bank charges, missing entries and date differences before finalizing."
              : "The bank and app totals match. Verify individual transactions before marking the reconciliation complete."}
          </p>
        </div>
      </div>
    </section>
  );
}