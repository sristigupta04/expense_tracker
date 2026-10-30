
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Pencil,
  Wallet,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  Receipt,
  TrendingUp,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerCreditCards";

function readCards() {
  try {
    const cards = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(cards) ? cards : [];
  } catch {
    return [];
  }
}

function formatMoney(amount, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `₹${(Number(amount) || 0).toLocaleString("en-IN")}`;
  }
}

function formatDate(date) {
  if (!date) return "Not set";

  const value = String(date);

  // Handle YYYY-MM-DD without timezone shifting.
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  const parsed = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      )
    : new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCardCreatedDate(date) {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CreditCardDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const card = useMemo(
    () => readCards().find((item) => String(item.id) === String(id)),
    [id]
  );

  if (!card) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0D21A1]">
            <CreditCard size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Credit card not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This card may not exist in this browser or the card ID may be incorrect.
          </p>

          <button
            type="button"
            onClick={() => navigate("/credit-cards")}
            className="mt-6 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E]"
          >
            Back to Credit Cards
          </button>
        </div>
      </main>
    );
  }

  const limit = Math.max(0, Number(card.creditLimit) || 0);
  const outstanding = Math.max(0, Number(card.outstandingAmount) || 0);

  const available = Math.max(0, limit - outstanding);
  const minimumDue = Math.max(0, Number(card.minimumDue) || 0);

  const utilization =
    limit > 0 ? Math.min(100, (outstanding / limit) * 100) : 0;

  const currency = card.currency || "INR";
  const isArchived = card.status === "Archived";

  const details = [
    ["Card nickname", card.cardName || "—"],
    ["Bank / issuer", card.bankName || "—"],
    ["Card type", card.cardType || "Credit"],
    [
      "Card number",
      card.lastFourDigits
        ? `•••• •••• •••• ${card.lastFourDigits}`
        : "Not provided",
    ],
    ["Currency", currency],
    ["Statement date", formatDate(card.statementDate)],
    ["Payment due date", formatDate(card.dueDate)],
    ["Minimum amount due", formatMoney(minimumDue, currency)],
    ["Status", card.status || "Active"],
    ["Date added", getCardCreatedDate(card.createdAt)],
    ["Last updated", getCardCreatedDate(card.updatedAt)],
  ];

  const statusClass =
    card.status === "Active"
      ? "bg-emerald-50 text-emerald-700"
      : card.status === "Blocked"
        ? "bg-rose-50 text-rose-700"
        : card.status === "Archived"
          ? "bg-slate-100 text-slate-600"
          : "bg-amber-50 text-amber-700";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Back Navigation */}
        <Link
          to="/credit-cards"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0D21A1]"
        >
          <ArrowLeft size={17} />
          Back to Credit Cards
        </Link>

        {/* Page Header */}
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#2563EB]">
              Banking / Credit Cards / Details
            </p>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {card.cardName || "Credit Card Details"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {card.bankName || "Bank issuer"} · Credit card
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/credit-cards/${card.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Pencil size={16} />
              Edit Card
            </Link>

            {!isArchived && (
              <Link
                to={`/credit-cards/${card.id}/payment`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E]"
              >
                <Wallet size={17} />
                Record Payment
              </Link>
            )}
          </div>
        </header>

        {/* Card Overview */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#03045E] via-[#023E8A] to-[#2563EB] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10" />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-blue-100">
                  {card.bankName || "Bank issuer"}
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  {card.cardName || "My Credit Card"}
                </h2>

                <p className="mt-4 font-mono text-sm tracking-[0.2em] text-blue-100">
                  •••• •••• •••• {card.lastFourDigits || "••••"}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                {card.status || "Active"}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-blue-100">Available credit</p>

              <p className="mt-2 break-words text-3xl font-extrabold sm:text-4xl">
                {formatMoney(available, currency)}
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <OverviewItem
                title="Total credit limit"
                value={formatMoney(limit, currency)}
              />

              <OverviewItem
                title="Outstanding balance"
                value={formatMoney(outstanding, currency)}
              />

              <OverviewItem
                title="Minimum due"
                value={formatMoney(minimumDue, currency)}
              />
            </div>
          </div>
        </section>

        {/* Details and Side Panels */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Card Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-[#0D21A1]">
                <CreditCard size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Card Information
                </h2>
                <p className="text-xs text-slate-500">
                  Your saved card details
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {details.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="text-sm text-slate-500">
                    {label}
                  </span>

                  <span className="break-words text-sm font-semibold text-slate-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">

            {/* Credit Utilization */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-[#0D21A1]">
                  <TrendingUp size={20} />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Credit Utilization
                </h2>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">
                  Limit used
                </span>

                <span className="text-xl font-extrabold text-slate-900">
                  {utilization.toFixed(1)}%
                </span>
              </div>

              <div
                className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Credit utilization"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(utilization)}
              >
                <div
                  className={`h-full rounded-full transition-all ${
                    utilization >= 80
                      ? "bg-rose-500"
                      : utilization >= 30
                        ? "bg-amber-500"
                        : "bg-blue-700"
                  }`}
                  style={{ width: `${utilization}%` }}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {utilization >= 80
                  ? "Most of your credit limit is in use. Review your outstanding balance."
                  : utilization >= 30
                    ? "A portion of your credit limit is in use. Keep monitoring your balance."
                    : "Your current credit utilization is relatively low."}
              </p>

              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Used credit</span>
                  <span className="font-semibold text-slate-800">
                    {formatMoney(outstanding, currency)}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-slate-500">Remaining credit</span>
                  <span className="font-semibold text-emerald-700">
                    {formatMoney(available, currency)}
                  </span>
                </div>
              </div>
            </section>

            {/* Payment Dates */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-[#0D21A1]">
                  <CalendarDays size={20} />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Payment Dates
                </h2>
              </div>

              <div className="mt-4 rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-700">
                  Statement date
                </p>

                <p className="mt-1 font-bold text-blue-950">
                  {formatDate(card.statementDate)}
                </p>
              </div>

              <div className="mt-3 rounded-xl bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700">
                  Payment due date
                </p>

                <p className="mt-1 font-bold text-amber-950">
                  {formatDate(card.dueDate)}
                </p>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                These are saved dates, not live reminders from your bank.
              </p>
            </section>
          </aside>
        </div>

        {/* Payment History */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-[#0D21A1]">
              <Receipt size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Payment History
              </h2>

              <p className="text-xs text-slate-500">
                Payments recorded for this card
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
            <AlertCircle
              size={25}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Payment history is not connected yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
              After payment recording is implemented, saved payments
              will appear here.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/credit-cards"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              All Credit Cards
            </Link>

            {!isArchived && (
              <Link
                to={`/credit-cards/${card.id}/payment`}
                className="rounded-xl bg-[#0D21A1] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E]"
              >
                Record a Payment
              </Link>
            )}
          </div>
        </section>

        {/* Security Notice */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-blue-700" />

          <p className="text-xs leading-5 text-slate-600">
            Demo mode: card details are read from this browser's local
            storage. This page does not connect to a bank or process real
            payments. Never store full card numbers, CVV, PIN or OTP.
          </p>
        </div>
      </div>
    </main>
  );
}

function OverviewItem({ title, value }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-4">
      <p className="text-sm text-blue-100">{title}</p>
      <p className="mt-2 break-words text-lg font-bold sm:text-xl">
        {value}
      </p>
    </div>
  );
}
