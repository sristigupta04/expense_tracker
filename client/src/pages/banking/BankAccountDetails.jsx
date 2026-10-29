
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "expenseTrackerBankAccounts";

const money = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function BankAccountDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const account = useMemo(() => {
    try {
      const accounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(accounts)
        ? accounts.find((item) => String(item.id) === String(id))
        : null;
    } catch {
      return null;
    }
  }, [id]);

  if (!account) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="text-4xl">🏦</div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Account not found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This account may not exist in this browser, or its ID may be incorrect.
          </p>
          <button
            onClick={() => navigate("/bank-accounts")}
            className="mt-6 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Back to Bank Accounts
          </button>
        </div>
      </main>
    );
  }

  const balance = Number(account.currentBalance ?? account.openingBalance ?? 0);
  const openingBalance = Number(account.openingBalance ?? 0);
  const currency = account.currency || "INR";

  const details = [
    ["Account nickname", account.accountName || "—"],
    ["Bank / Provider", account.bankName || "—"],
    ["Account type", account.accountType || "—"],
    ["Last 4 digits", account.accountNumber ? `•••• ${account.accountNumber}` : "Not provided"],
    ["Currency", currency],
    ["Status", account.status || "Active"],
    [
      "Date added",
      account.createdAt
        ? new Date(account.createdAt).toLocaleDateString("en-IN")
        : "—",
    ],
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          ← Back
        </button>

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Banking / Account Details
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {account.accountName}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {account.bankName} · {account.accountType}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/bank-accounts/${account.id}/edit`}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Edit Account
            </Link>
            <Link
              to="/money-transfers"
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Transfer Money
            </Link>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-blue-100">Current balance</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                {money(balance, currency)}
              </h2>
              <p className="mt-3 text-sm text-blue-100">
                {account.bankName} ·•••• {account.accountNumber || "----"}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                account.status === "Archived"
                  ? "bg-white/15 text-blue-100"
                  : "bg-emerald-400/20 text-emerald-100"
              }`}
            >
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
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Account information
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

            {account.notes && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Notes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                  {account.notes}
                </p>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Quick actions
              </h2>
              <div className="mt-4 space-y-3">
                <Link
                  to="/bank-accounts"
                  className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View all accounts →
                </Link>
                <Link
                  to="/bank-transactions"
                  className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Bank transactions →
                </Link>
                <Link
                  to="/bank-statements"
                  className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Bank statements →
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <h2 className="font-bold text-blue-950">About this account</h2>
              <p className="mt-2 text-sm leading-6 text-blue-900/75">
                Account balances currently come from your saved browser data.
                Transaction history and bank statement reconciliation will
                appear here after those features are connected.
              </p>
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Recent transactions
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            No account-specific transaction history is connected yet. Once
            banking transactions are implemented, they will appear here.
          </p>
          <Link
            to="/bank-transactions"
            className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            Go to bank transactions →
          </Link>
        </section>
      </div>
    </main>
  );
}
