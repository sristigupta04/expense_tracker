
import { Link } from "react-router-dom";
import {
  Wallet,
  ArrowUpRight,
  Pencil,
  Eye,
  Building2,
  CheckCircle2,
  Clock3,
  Ban,
} from "lucide-react";

const accountTypeStyles = {
  Savings: "bg-blue-50 text-blue-700 ring-blue-100",
  Current: "bg-violet-50 text-violet-700 ring-violet-100",
  Salary: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Business: "bg-amber-50 text-amber-700 ring-amber-100",
  Cash: "bg-orange-50 text-orange-700 ring-orange-100",
  Other: "bg-slate-100 text-slate-700 ring-slate-200",
};

const getStatusDetails = (status) => {
  const normalizedStatus = String(status || "Active").toLowerCase();

  if (normalizedStatus === "active") {
    return {
      label: "Active",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700",
    };
  }

  if (normalizedStatus === "pending") {
    return {
      label: "Pending",
      icon: Clock3,
      className: "bg-amber-50 text-amber-700",
    };
  }

  if (normalizedStatus === "inactive") {
    return {
      label: "Inactive",
      icon: Ban,
      className: "bg-slate-100 text-slate-600",
    };
  }

  return {
    label: String(status || "Unknown"),
    icon: Ban,
    className: "bg-slate-100 text-slate-600",
  };
};

const formatCurrency = (amount, currency = "INR") => {
  const value = Number(amount);
  const safeValue = Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    return `₹${safeValue.toLocaleString("en-IN")}`;
  }
};

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return "•••• ••••";

  const digits = String(accountNumber).replace(/\s/g, "");

  if (digits.length <= 4) {
    return `•••• ${digits}`;
  }

  return `•••• •••• ${digits.slice(-4)}`;
};

export default function AccountCard({ account }) {
  if (!account) return null;

  const {
    id,
    _id,
    accountName = "My Account",
    bankName = "Bank",
    accountType = "Other",
    accountNumber = "",
    currentBalance,
    openingBalance = 0,
    currency = "INR",
    status = "Active",
  } = account;

  const accountId = id ?? _id;

  const balance =
    currentBalance !== undefined && currentBalance !== null
      ? currentBalance
      : openingBalance;

  const typeClass =
    accountTypeStyles[accountType] || accountTypeStyles.Other;

  const statusDetails = getStatusDetails(status);
  const StatusIcon = statusDetails.icon;

  const detailsPath = accountId
    ? `/bank-accounts/${accountId}`
    : "/bank-accounts";

  const editPath = accountId
    ? `/bank-accounts/${accountId}/edit`
    : "/bank-accounts";

  const canNavigate = accountId != null;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-50 transition-transform duration-300 group-hover:scale-125" />

      <div className="pointer-events-none absolute right-10 top-20 h-16 w-16 rounded-full bg-indigo-50/70" />

      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-md shadow-blue-900/15">
              <Building2 size={23} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h3
                className="truncate text-base font-bold text-slate-900"
                title={accountName}
              >
                {accountName}
              </h3>

              <p
                className="mt-1 truncate text-sm text-slate-500"
                title={bankName}
              >
                {bankName}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${typeClass}`}
          >
            {accountType}
          </span>
        </div>

        {/* Account number */}
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Account number
          </p>

          <p className="mt-1.5 font-mono text-sm tracking-widest text-slate-600">
            {maskAccountNumber(accountNumber)}
          </p>
        </div>

        {/* Balance */}
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-500">
              Current balance
            </p>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
              <Wallet size={17} />
            </div>
          </div>

          <p
            className={`mt-2 break-words text-2xl font-bold tracking-tight sm:text-3xl ${
              Number(balance) < 0 ? "text-red-600" : "text-slate-900"
            }`}
          >
            {formatCurrency(balance, currency)}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusDetails.className}`}
            >
              <StatusIcon size={13} />
              {statusDetails.label}
            </span>

            <span className="text-xs font-medium text-slate-400">
              {currency}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          {canNavigate ? (
            <>
              <Link
                to={detailsPath}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Eye size={16} />
                View Details
                <ArrowUpRight size={15} />
              </Link>

              <Link
                to={editPath}
                aria-label={`Edit ${accountName}`}
                title="Edit account"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Pencil size={17} />
              </Link>
            </>
          ) : (
            <div className="w-full rounded-xl bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
              Account ID unavailable
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
