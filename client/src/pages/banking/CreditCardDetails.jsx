
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  if (!date) return "Not set";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

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
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="text-4xl">💳</div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Credit card not found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This card may not exist in this browser or the card ID may be incorrect.
          </p>
          <button
            type="button"
            onClick={() => navigate("/credit-cards")}
            className="mt-6 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Back to Credit Cards
          </button>
        </div>
      </main>
    );
  }

  const limit = Number(card.creditLimit) || 0;
  const outstanding = Number(card.outstandingAmount) || 0;
  const available = Math.max(0, limit - outstanding);
  const minimumDue = Number(card.minimumDue) || 0;
  const utilization =
    limit > 0 ? Math.min(100, (outstanding / limit) * 100) : 0;
  const currency = card.currency || "INR";

  const details = [
    ["Card nickname", card.cardName || "—"],
    ["Bank / issuer", card.bankName || "—"],
    ["Card type", card.cardType || "Credit"],
    [
      "Card number",
      card.lastFourDigits ? `•••• •••• •••• ${card.lastFourDigits}` : "Not provided",
    ],
    ["Currency", currency],
    ["Statement date", formatDate(card.statementDate)],
    ["Payment due date", formatDate(card.dueDate)],
    ["Minimum amount due", formatMoney(minimumDue, currency)],
    ["Status", card.status || "Active"],
    [
      "Date added",
      card.createdAt
        ? new Date(card.createdAt).toLocaleDateString("en-IN")
        : "—",
    ],
  ];

  const isArchived = card.status === "Archived";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          ← Back
        </button>

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Banking / Credit Cards / Details
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {card.cardName || "Credit Card Details"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {card.bankName || "Bank issuer"} · Credit card
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/credit-cards/${card.id}/edit`}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Edit Card
            </Link>
            <Link
              to={`/credit-cards/${card.id}/payment`}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Record Payment
            </Link>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-blue-100">
                {card.bankName || "Bank issuer"}
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                {card.cardName || "My Credit Card"}
              </h2>
              <p className="mt-4 text-sm tracking-[0.2em] text-blue-100">
                •••• •••• •••• {card.lastFourDigits || "••••"}
              </p>
            </div>
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold">
              {card.status || "Active"}
            </span>
          </div>

          <div className="mt-8">
            <p className="text-sm text-blue-100">Available credit</p>
            <p className="mt-2 text-3xl font-bold sm:text-4xl">
              {formatMoney(available, currency)}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm text-blue-100">Total credit limit</p>
              <p className="mt-2 text-xl font-bold">
                {formatMoney(limit, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm text-blue-100">Outstanding balance</p>
              <p className="mt-2 text-xl font-bold">
                {formatMoney(outstanding, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-sm text-blue-100">Minimum due</p>
              <p className="mt-2 text-xl font-bold">
                {formatMoney(minimumDue, currency)}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900">
              Card information
            </h2>

            <div className="mt-5 divide-y divide-slate-100">
              {details.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="break-words text-sm font-semibold text-slate-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Credit utilization
              </h2>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Limit used</span>
                <span className="text-lg font-bold text-slate-900">
                  {Math.round(utilization)}%
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
                    utilization >= 80 ? "bg-red-500" : "bg-blue-700"
                  }`}
                  style={{ width: `${utilization}%` }}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {utilization >= 80
                  ? "Most of the credit limit is in use. Review your outstanding balance."
                  : "This shows how much of your total credit limit is currently used."}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Payment dates
              </h2>

              <div className="mt-4 rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-medium text-blue-700">
                  Statement date
                </p>
                <p className="mt-1 font-bold text-blue-950">
                  {formatDate(card.statementDate)}
                </p>
              </div>

              <div className="mt-3 rounded-xl bg-amber-50 p-4">
                <p className="text-xs font-medium text-amber-700">
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

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Payment history
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Payment history is not connected yet. After payment recording is
            implemented, saved payments will appear here.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/credit-cards"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              All credit cards
            </Link>

            {!isArchived && (
              <Link
                to={`/credit-cards/${card.id}/payment`}
                className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Record a payment
              </Link>
            )}
          </div>
        </section>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Demo mode: card details are read from this browser's local storage.
          This page does not connect to a bank or process real payments. Never
          store full card numbers, CVV, PIN or OTP.
        </p>
      </div>
    </main>
  );
}
