
import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  Building2,
  ArrowLeftRight,
  ReceiptText,
  FileSpreadsheet,
  ClipboardCheck,
  Plus,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Landmark,
} from "lucide-react";

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

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(toNumber(value));
  } catch {
    return `₹${toNumber(value).toLocaleString("en-IN")}`;
  }
}

function isActive(item) {
  return !["Archived", "Inactive", "Closed", "Blocked"].includes(
    item.status
  );
}

const quickActions = [
  {
    title: "Add Bank Account",
    description: "Add savings, salary or cash accounts.",
    href: "/bank-accounts/add",
    icon: Plus,
    color: "blue",
  },
  {
    title: "Money Transfers",
    description: "Manage transfers between your accounts.",
    href: "/money-transfers",
    icon: ArrowLeftRight,
    color: "violet",
  },
  {
    title: "Bank Transactions",
    description: "Review deposits and withdrawals.",
    href: "/bank-transactions",
    icon: ReceiptText,
    color: "emerald",
  },
  {
    title: "Bank Statements",
    description: "Import and review bank statements.",
    href: "/bank-statements",
    icon: FileSpreadsheet,
    color: "amber",
  },
  {
    title: "Reconciliation",
    description: "Compare statement and app transactions.",
    href: "/reconciliation",
    icon: ClipboardCheck,
    color: "cyan",
  },
  {
    title: "Credit Cards",
    description: "Track credit limits and outstanding dues.",
    href: "/credit-cards",
    icon: CreditCard,
    color: "rose",
  },
];

export default function BankingDashboard() {
  const accounts = useMemo(
    () => readStorage(ACCOUNT_KEY),
    []
  );

  const cards = useMemo(
    () => readStorage(CARD_KEY),
    []
  );

  const activeAccounts = accounts.filter(isActive);
  const activeCards = cards.filter(isActive);

  // Do not combine different currencies into one total.
  const inrAccounts = activeAccounts.filter(
    (account) => (account.currency || "INR") === "INR"
  );

  const inrCards = activeCards.filter(
    (card) => (card.currency || "INR") === "INR"
  );

  const inrBalance = inrAccounts.reduce(
    (total, account) =>
      total +
      toNumber(account.currentBalance ?? account.openingBalance),
    0
  );

  const totalCreditLimit = inrCards.reduce(
    (total, card) => total + toNumber(card.creditLimit),
    0
  );

  const totalOutstanding = inrCards.reduce(
    (total, card) => total + toNumber(card.outstandingAmount),
    0
  );

  const availableCredit = Math.max(
    0,
    totalCreditLimit - totalOutstanding
  );

  const utilization =
    totalCreditLimit > 0
      ? Math.min(
          100,
          (totalOutstanding / totalCreditLimit) * 100
        )
      : 0;

  const stats = [
    {
      label: "Total INR Account Balance",
      value: formatMoney(inrBalance),
      detail: `${inrAccounts.length} active INR account(s)`,
      icon: Wallet,
      color: "blue",
    },
    {
      label: "Active Bank Accounts",
      value: String(activeAccounts.length),
      detail: `${accounts.length} total account(s)`,
      icon: Building2,
      color: "violet",
    },
    {
      label: "Credit Card Outstanding",
      value: formatMoney(totalOutstanding),
      detail: `${inrCards.length} active INR card(s)`,
      icon: CreditCard,
      color: "rose",
    },
    {
      label: "Available Credit",
      value: formatMoney(availableCredit),
      detail: `Limit: ${formatMoney(totalCreditLimit)}`,
      icon: TrendingUp,
      color: "emerald",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Page Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#2563EB]">
              Expense Tracker / Banking
            </p>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Banking Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your accounts, balances, transfers and credit cards.
            </p>
          </div>

          <Link
            to="/bank-accounts/add"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#03045E]"
          >
            <Plus size={18} />
            Add Bank Account
          </Link>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#2563EB] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-4 -top-8 h-40 w-40 rounded-full border border-white/10" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <Landmark size={14} />
                Your banking overview
              </div>

              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Keep your money organized.
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Review your saved accounts and credit-card limits.
                Use your banking shortcuts to manage your financial records.
              </p>

              <Link
                to="/bank-accounts"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-blue-200"
              >
                View all accounts
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm sm:min-w-56">
              <p className="text-sm text-blue-100">
                Combined INR balance
              </p>

              <p className="mt-2 break-words text-2xl font-extrabold">
                {formatMoney(inrBalance)}
              </p>

              <p className="mt-2 text-xs text-blue-100">
                Active INR accounts only
              </p>
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <SummaryCard key={stat.label} stat={stat} />
          ))}
        </section>

        {/* Accounts and Credit Utilization */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Bank Accounts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your Bank Accounts
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Accounts saved in this browser.
                </p>
              </div>

              <Link
                to="/bank-accounts"
                className="text-sm font-semibold text-[#0D21A1] transition hover:text-[#03045E]"
              >
                View all →
              </Link>
            </div>

            {activeAccounts.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0D21A1]">
                  <Building2 size={26} />
                </div>

                <h3 className="mt-3 font-semibold text-slate-800">
                  No active bank accounts
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add an account to start tracking its balance.
                </p>

                <Link
                  to="/bank-accounts/add"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#03045E]"
                >
                  <Plus size={16} />
                  Add Your First Account
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
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-[#0D21A1]">
                        {(account.bankName || "B")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {account.accountName || "Unnamed account"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {account.bankName || "Bank"} ·{" "}
                          {account.accountType || "Account"}
                          {account.accountNumber
                            ? ` · •••• ${account.accountNumber}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <p className="break-words font-bold text-slate-900 sm:text-right">
                      {formatMoney(
                        account.currentBalance ??
                          account.openingBalance,
                        account.currency || "INR"
                      )}
                    </p>
                  </Link>
                ))}

                {activeAccounts.length > 5 && (
                  <Link
                    to="/bank-accounts"
                    className="block rounded-xl border border-dashed border-slate-200 px-4 py-3 text-center text-sm font-semibold text-[#0D21A1] hover:bg-blue-50"
                  >
                    View {activeAccounts.length - 5} more accounts →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Credit Utilization */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Credit Utilization
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  INR credit cards only
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-2.5 text-[#0D21A1]">
                <CreditCard size={21} />
              </div>
            </div>

            <div className="mt-7">
              <div className="flex items-end justify-between gap-3">
                <span className="text-sm text-slate-500">
                  Used credit
                </span>

                <span className="text-2xl font-extrabold text-slate-900">
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
                        : "bg-[#2563EB]"
                  }`}
                  style={{ width: `${utilization}%` }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                {totalCreditLimit === 0
                  ? "Add an active INR credit card to see utilization."
                  : utilization >= 80
                    ? "A large portion of your credit limit is in use."
                    : utilization >= 30
                      ? "Keep monitoring your outstanding credit balance."
                      : "Your current credit utilization is relatively low."}
              </p>

              <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                <MoneyRow
                  label="Outstanding"
                  value={formatMoney(totalOutstanding)}
                  valueClass="text-rose-600"
                />

                <MoneyRow
                  label="Available credit"
                  value={formatMoney(availableCredit)}
                  valueClass="text-emerald-700"
                />

                <MoneyRow
                  label="Total credit limit"
                  value={formatMoney(totalCreditLimit)}
                />
              </div>
            </div>

            <Link
              to="/credit-cards"
              className="mt-6 block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0D21A1]"
            >
              Manage Credit Cards →
            </Link>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Open a banking feature.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.title}
                action={action}
              />
            ))}
          </div>
        </section>

        {/* Security / Demo Notice */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-blue-700"
          />

          <p className="text-xs leading-5 text-slate-600">
            Demo mode: account balances and credit-card information are
            read from this browser's local storage. Live bank connections
            and real-money transfers are not enabled.
          </p>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ stat }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  const Icon = stat.icon;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-5 text-slate-500">
          {stat.label}
        </p>

        <div className={`rounded-xl p-2.5 ${colors[stat.color]}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 break-words text-2xl font-extrabold text-slate-900">
        {stat.value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {stat.detail}
      </p>
    </article>
  );
}

function MoneyRow({ label, value, valueClass = "text-slate-900" }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`break-words text-right font-semibold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function QuickActionCard({ action }) {
  const Icon = action.icon;

  const colors = {
    blue: "bg-blue-50 text-blue-700 group-hover:bg-blue-700",
    violet: "bg-violet-50 text-violet-700 group-hover:bg-violet-700",
    emerald: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700",
    amber: "bg-amber-50 text-amber-700 group-hover:bg-amber-600",
    cyan: "bg-cyan-50 text-cyan-700 group-hover:bg-cyan-700",
    rose: "bg-rose-50 text-rose-700 group-hover:bg-rose-700",
  };

  return (
    <Link
      to={action.href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:text-white ${colors[action.color]}`}
        >
          <Icon size={22} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">
              {action.title}
            </h3>

            <ArrowUpRight
              size={16}
              className="shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0D21A1]"
            />
          </div>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {action.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
