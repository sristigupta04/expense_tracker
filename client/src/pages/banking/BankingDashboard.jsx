
import { useMemo } from "react";
import { Link } from "react-router-dom";

const ACCOUNT_KEY = "expenseTrackerBankAccounts";
const CARD_KEY = "expenseTrackerCreditCards";

function readStorage(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function formatMoney(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

const quickActions = [
  {
    title: "Add Bank Account",
    description: "Add savings, salary or cash accounts.",
    href: "/bank-accounts/add",
    icon: "＋",
  },
  {
    title: "Money Transfers",
    description: "Manage transfers between accounts.",
    href: "/money-transfers",
    icon: "⇄",
  },
  {
    title: "Bank Transactions",
    description: "Review deposits and withdrawals.",
    href: "/bank-transactions",
    icon: "↕",
  },
  {
    title: "Bank Statements",
    description: "Import and review statements.",
    href: "/bank-statements",
    icon: "▤",
  },
  {
    title: "Reconciliation",
    description: "Compare recorded and statement balances.",
    href: "/reconciliation",
    icon: "✓",
  },
  {
    title: "Credit Cards",
    description: "Track limits, dues and outstanding amounts.",
    href: "/credit-cards",
    icon: "▣",
  },
];

export default function BankingDashboard() {
  const accounts = useMemo(() => readStorage(ACCOUNT_KEY), []);
  const cards = useMemo(() => readStorage(CARD_KEY), []);

  const activeAccounts = accounts.filter(
    (account) => account.status !== "Archived"
  );

  const activeCards = cards.filter((card) => card.status !== "Archived");

  // Sum balances only for INR accounts to avoid mixing currencies.
  const inrBalance = activeAccounts
    .filter((account) => (account.currency || "INR") === "INR")
    .reduce(
      (total, account) =>
        total +
        Number(account.currentBalance ?? account.openingBalance ?? 0),
      0
    );

  const totalCreditLimit = activeCards
    .filter((card) => (card.currency || "INR") === "INR")
    .reduce((total, card) => total + Number(card.creditLimit || 0), 0);

  const totalOutstanding = activeCards
    .filter((card) => (card.currency || "INR") === "INR")
    .reduce((total, card) => total + Number(card.outstandingAmount || 0), 0);

  const availableCredit = Math.max(0, totalCreditLimit - totalOutstanding);

  const utilization =
    totalCreditLimit > 0
      ? Math.min(100, (totalOutstanding / totalCreditLimit) * 100)
      : 0;

  const stats = [
    {
      label: "Total INR account balance",
      value: formatMoney(inrBalance),
      detail: `${activeAccounts.length} active account(s)`,
      icon: "₹",
    },
    {
      label: "Active bank accounts",
      value: String(activeAccounts.length),
      detail: `${accounts.length} total account(s)`,
      icon: "▤",
    },
    {
      label: "Credit card outstanding",
      value: formatMoney(totalOutstanding),
      detail: `${activeCards.length} active card(s)`,
      icon: "▣",
    },
    {
      label: "Available credit",
      value: formatMoney(availableCredit),
      detail: `Limit: ${formatMoney(totalCreditLimit)}`,
      icon: "↗",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Expense Tracker / Banking
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Banking Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage accounts, balances, transfers and credit cards in one place.
            </p>
          </div>

          <Link
            to="/bank-accounts/add"
            className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            + Add Account
          </Link>
        </div>

        <section className="mb-7 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-blue-100">Your banking overview</p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Keep your money organized.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Review your saved accounts and credit-card limits, and use the
                shortcuts below to manage your finances.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 sm:min-w-52">
              <p className="text-sm text-blue-100">Combined INR balance</p>
              <p className="mt-2 text-2xl font-bold">
                {formatMoney(inrBalance)}
              </p>
              <p className="mt-2 text-xs text-blue-100">
                From active INR accounts only
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-5 text-slate-500">
                  {stat.label}
                </p>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
                  {stat.icon}
                </span>
              </div>
              <p className="mt-4 break-words text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-slate-500">{stat.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your bank accounts
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Accounts saved in this browser.
                </p>
              </div>
              <Link
                to="/bank-accounts"
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                View all →
              </Link>
            </div>

            {activeAccounts.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <div className="text-3xl">🏦</div>
                <h3 className="mt-3 font-semibold text-slate-800">
                  No bank accounts yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add an account to start tracking its balance.
                </p>
                <Link
                  to="/bank-accounts/add"
                  className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Add your first account
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {activeAccounts.slice(0, 5).map((account) => (
                  <Link
                    key={account.id}
                    to={`/bank-accounts/${account.id}`}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/50 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                        {(account.bankName || "B").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {account.accountName || "Unnamed account"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {account.bankName} · {account.accountType}
                          {account.accountNumber
                            ? ` ·•••• ${account.accountNumber}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-900">
                      {formatMoney(
                        account.currentBalance ?? account.openingBalance,
                        account.currency || "INR"
                      )}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Credit utilization
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              INR credit cards only
            </p>

            <div className="mt-6">
              <div className="flex items-end justify-between gap-3">
                <span className="text-sm text-slate-500">Used credit</span>
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
                  className="h-full rounded-full bg-blue-700 transition-all"
                  style={{ width: `${utilization}%` }}
                />
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Outstanding</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(totalOutstanding)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Available credit</span>
                  <span className="font-semibold text-emerald-700">
                    {formatMoney(availableCredit)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500">Total limit</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(totalCreditLimit)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/credit-cards"
              className="mt-6 block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage credit cards →
            </Link>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Quick actions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Open a banking feature.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                    {action.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-7 text-xs leading-5 text-slate-500">
          Demo mode: balances and credit-card information are read from this
          browser's local storage. Live bank connections, statement imports,
          transfers, and transaction history are not connected yet.
        </p>
      </div>
    </main>
  );
}
