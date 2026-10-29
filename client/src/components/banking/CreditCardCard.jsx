import { Link } from "react-router-dom";
import {
  CreditCard,
  Eye,
  Pencil,
  ArrowUpRight,
  Wifi,
  ShieldCheck,
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

const getCardNumber = (number) => {
  if (!number) return "•••• •••• •••• ••••";

  const digits = String(number).replace(/\s/g, "");
  const lastFour = digits.slice(-4);

  return `•••• •••• •••• ${lastFour}`;
};

const getBrandStyles = (brand = "") => {
  const normalizedBrand = brand.toLowerCase();

  if (normalizedBrand.includes("visa")) {
    return {
      label: "VISA",
      className: "italic font-black tracking-wide",
    };
  }

  if (normalizedBrand.includes("master")) {
    return {
      label: "mastercard",
      className: "font-bold lowercase tracking-tight",
    };
  }

  if (normalizedBrand.includes("rupay")) {
    return {
      label: "RuPay",
      className: "font-black italic",
    };
  }

  return {
    label: brand || "CARD",
    className: "font-bold uppercase tracking-wider",
  };
};

export default function CreditCardCard({ card }) {
  if (!card) return null;

  const {
    id,
    cardName = "My Credit Card",
    bankName = "Bank",
    cardNumber = "",
    cardHolder = "",
    cardBrand = "",
    creditLimit = 0,
    availableLimit,
    currency = "INR",
    status = "Active",
    dueDate,
    billingDate,
    outstandingBalance,
  } = card;

  const limit = Math.max(0, Number(creditLimit || 0));

  const available =
    availableLimit !== undefined && availableLimit !== null
      ? Math.max(0, Number(availableLimit))
      : Math.max(
          0,
          limit - Number(outstandingBalance || 0)
        );

  const used = Math.max(0, limit - available);

  const usagePercentage =
    limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  const brand = getBrandStyles(cardBrand);

  const normalizedStatus = String(status).toLowerCase();

  const isActive = normalizedStatus === "active";

  const statusClass = isActive
    ? "bg-emerald-50 text-emerald-700"
    : normalizedStatus === "blocked"
      ? "bg-rose-50 text-rose-700"
      : "bg-slate-100 text-slate-600";

  const progressClass =
    usagePercentage >= 80
      ? "bg-rose-500"
      : usagePercentage >= 50
        ? "bg-amber-400"
        : "bg-emerald-400";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      <div className="p-4 sm:p-5">
        {/* Premium card preview */}
        <div className="relative min-h-[205px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#03045E] via-[#0D21A1] to-[#2563EB] p-5 text-white shadow-lg shadow-blue-900/20">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-7 h-36 w-36 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-16 left-16 h-36 w-36 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <CreditCard size={21} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {cardName}
                </p>
                <p className="mt-0.5 truncate text-xs text-blue-100">
                  {bankName}
                </p>
              </div>
            </div>

            <Wifi
              size={22}
              className="rotate-90 text-white/80"
              aria-label="Contactless card"
            />
          </div>

          <div className="relative mt-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100">
              Card Number
            </p>

            <p className="mt-2 font-mono text-base tracking-[0.12em] sm:text-lg">
              {getCardNumber(cardNumber)}
            </p>
          </div>

          <div className="relative mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-blue-100">
                Card Holder
              </p>
              <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide">
                {cardHolder || "CARD HOLDER"}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className={`text-lg ${brand.className}`}>
                {brand.label}
              </p>
              <p className="mt-0.5 text-[9px] text-blue-100">
                CREDIT
              </p>
            </div>
          </div>
        </div>

        {/* Status and limit */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Available Credit
            </p>

            <p className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(available, currency)}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold capitalize ${statusClass}`}
          >
            <ShieldCheck size={14} />
            {status}
          </span>
        </div>

        {/* Credit utilization */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500">
              Credit Utilization
            </span>

            <span className="text-xs font-bold text-slate-700">
              {usagePercentage.toFixed(0)}%
            </span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Credit utilization"
            aria-valuenow={Math.round(usagePercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressClass}`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">
              Used:{" "}
              <span className="font-semibold text-slate-700">
                {formatCurrency(used, currency)}
              </span>
            </span>

            <span className="text-slate-500">
              Limit: {formatCurrency(limit, currency)}
            </span>
          </div>
        </div>

        {/* Billing information */}
        {(billingDate || dueDate) && (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
            <div>
              <p className="text-xs text-slate-500">
                Billing Date
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {billingDate || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Payment Due
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {dueDate || "—"}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
          <Link
            to={`/credit-cards/${id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Eye size={16} />
            View Details
            <ArrowUpRight size={15} />
          </Link>

          <Link
            to={`/credit-cards/${id}/edit`}
            aria-label={`Edit ${cardName}`}
            title="Edit credit card"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Pencil size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}