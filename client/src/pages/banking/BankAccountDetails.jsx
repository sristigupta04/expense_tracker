
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CreditCard,
  Landmark,
  Pencil,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerBankAccounts";

function readAccounts() {
  try {
    const accounts = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function money(amount, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(toNumber(amount));
  } catch {
    return `${currency} ${toNumber(amount).toLocaleString("en-IN")}`;
  }
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="break-words text-sm font-semibold text-slate-800 sm:text-right">
        {value || "—"}
      </span>
    </div>
  );
}

function ActionLink({ to, icon: Icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0D21A1]"
    >
      <span className="flex items-center gap-3">
        <Icon size={17} />
        {children}
      </span>
      <ArrowUpRight size={16} />
    </Link>
  );
}

export default function BankAccountDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const account = useMemo(() => {
    return readAccounts().find(
      (item) => String(item.id) === String(id)
    ) || null;
  }, [id]);

  if (!account) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0D21A1]">
            <Building2 size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Account not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This account may not exist in this browser, or its ID may be incorrect.
          </p>

          <button
            type="button"
            onClick={() => navigate("/bank-accounts")}
            className="mt-6 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E]"
          >
            Back to Bank Accounts
          </button>
        </div>
      </main>
    );
  }

  const balance = toNumber(
    account.currentBalance ?? account.openingBalance
  );

  const openingBalance = toNumber(account.openingBalance);
  const currency = account.currency || "INR";
  const isArchived = account.status === "Archived";

  const details = [
    ["Account nickname", account.accountName || "—"],
    ["Bank / Provider", account.bankName || "—"],
    ["Account type", account.accountType || "—"],
    [
      "Last 4 digits",
      account.accountNumber
        ? `•••• ${String(account.accountNumber).slice(-4)}`
        : "Not provided",
    ],
    ["Currency", currency],
    ["Status", account.status || "Active"],
    ["Date added", formatDate(account.createdAt)],
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0D21A1]"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#2563EB]">
              Banking / Account Details
            </p>

            <h1 className="mt-2 break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {account.accountName || "Bank Account"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {account.bankName || "Bank"} · {account.accountType || "Account"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/bank-accounts/${account.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Pencil size={16} />
              Edit Account
            </Link>

            <Link
              to="/money-transfers"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E]"
            >
              <ArrowUpRight size={16} />
              Money Transfers
            </Link>
          </div>
        </header>

        {/* Balance Overview */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#03045E] via-[#023E8A] to-[#2563EB] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-5 h-40 w-40 rounded-full border border-white/10" />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Wallet size={18} />
                  <p className="text-sm font-medium">Current balance</p>
                </div>

                <h2 className="mt-3 break-words text-3xl font-extrabold sm:text-4xl">
                  {money(balance, currency)}
                </h2>

                <p className="mt-3 text-sm text-blue-100">
                  {account.bankName || "Bank"} · ••••{" "}
                  {account.accountNumber
                    ? String(account.accountNumber).slice(-4)
                    : "----"}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isArchived
                    ? "bg-white/15 text-blue-100"
                    : "bg-emerald-400/20 text-emerald-100"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {account.status || "Active"}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm text-blue-100">Opening balance</p>
                <p className="mt-2 text-xl font-bold">
                  {money(openingBalance, currency)}
                </p>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm text-blue-100">Account type</p>
                <p className="mt-2 text-xl font-bold">
                  {account.accountType || "Savings"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Details and Sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Account Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-[#0D21A1]">
                <Landmark size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Account Information
                </h2>
                <p className="text-sm text-slate-500">
                  Saved account details
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {details.map(([label, value]) => (
                <InfoRow
                  key={label}
                  label={label}
                  value={value}
                />
              ))}
            </div>

            {account.notes && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {account.notes}
                </p>
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h2>

              <div className="mt-4 space-y-3">
                <ActionLink
                  to="/bank-accounts"
                  icon={Building2}
                >
                  All Bank Accounts
                </ActionLink>

                <ActionLink
                  to="/bank-transactions"
                  icon={ReceiptText}
                >
                  Bank Transactions
                </ActionLink>

                <ActionLink
                  to="/bank-statements"
                  icon={CalendarDays}
                >
                  Bank Statements
                </ActionLink>

                <ActionLink
                  to="/reconciliation"
                  icon={ShieldCheck}
                >
                  Reconciliation
                </ActionLink>

                <ActionLink
                  to="/credit-cards"
                  icon={CreditCard}
                >
                  Credit Cards
                </ActionLink>
              </div>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-center gap-2 text-[#0D21A1]">
                <ShieldCheck size={19} />
                <h2 className="font-bold">Account Information</h2>
              </div>

              <p className="mt-2 text-sm leading-6 text-blue-900/75">
                Account balances currently come from your saved browser data.
                This page does not connect to your bank or verify live balances.
              </p>
            </section>
          </aside>
        </div>

        {/* Recent Transactions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Transactions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Account-specific activity
              </p>
            </div>

            <Link
              to="/bank-transactions"
              className="text-sm font-semibold text-[#0D21A1] hover:text-[#03045E]"
            >
              View transactions →
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-9 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
              <ReceiptText size={23} />
            </div>

            <h3 className="mt-3 font-semibold text-slate-800">
              Account-specific history is not available
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              Your bank transactions are available in the transactions
              section. Account-specific filtering can be connected here
              when transaction records include an account ID.
            </p>

            <Link
              to="/bank-transactions"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[#0D21A1]"
            >
              <ReceiptText size={16} />
              Go to Bank Transactions
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
