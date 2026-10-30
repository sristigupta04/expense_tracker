
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Download,
  RefreshCw,
  Trash2,
  ReceiptText,
  Wallet,
  Filter,
  X,
  AlertCircle,
} from "lucide-react";

const TRANSACTIONS_KEY = "expenseTrackerBankTransactions";
const ACCOUNTS_KEY = "expenseTrackerBankAccounts";

function readStorage(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
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
  if (!date) return "—";

  const value = String(date);
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
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTransactionType(type) {
  const value = String(type || "").toLowerCase();

  if (["credit", "deposit", "income"].includes(value)) {
    return "credit";
  }

  if (["debit", "withdrawal", "expense"].includes(value)) {
    return "debit";
  }

  return "other";
}

function exportCSV(transactions) {
  const headers = [
    "Date",
    "Description",
    "Account",
    "Category",
    "Type",
    "Amount",
    "Currency",
    "Reference",
  ];

  const rows = transactions.map((transaction) => [
    transaction.date || "",
    transaction.description || "",
    transaction.accountName || "",
    transaction.category || "",
    transaction.type || "",
    transaction.amount ?? 0,
    transaction.currency || "INR",
    transaction.reference || "",
  ]);

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "bank-transactions.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function BankTransactions() {
  const [transactions, setTransactions] = useState(() =>
    readStorage(TRANSACTIONS_KEY)
  );

  const [accounts] = useState(() => readStorage(ACCOUNTS_KEY));

  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState("");

  const categories = useMemo(
    () => [
      ...new Set(
        transactions.map((item) => item.category).filter(Boolean)
      ),
    ],
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        const searchableText = [
          transaction.description,
          transaction.accountName,
          transaction.category,
          transaction.reference,
          transaction.type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchableText.includes(query);

        const matchesAccount =
          accountFilter === "all" ||
          String(transaction.accountId) === accountFilter;

        const matchesType =
          typeFilter === "all" ||
          getTransactionType(transaction.type) === typeFilter;

        const matchesCategory =
          categoryFilter === "all" ||
          transaction.category === categoryFilter;

        const date = String(transaction.date || "").slice(0, 10);

        const matchesFrom = !fromDate || date >= fromDate;
        const matchesTo = !toDate || date <= toDate;

        return (
          matchesSearch &&
          matchesAccount &&
          matchesType &&
          matchesCategory &&
          matchesFrom &&
          matchesTo
        );
      })
      .sort((a, b) =>
        String(b.date || "").localeCompare(String(a.date || ""))
      );
  }, [
    transactions,
    search,
    accountFilter,
    typeFilter,
    categoryFilter,
    fromDate,
    toDate,
  ]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (result, transaction) => {
        const amount = Math.abs(Number(transaction.amount) || 0);
        const type = getTransactionType(transaction.type);

        if (type === "credit") result.credits += amount;
        if (type === "debit") result.debits += amount;

        return result;
      },
      { credits: 0, debits: 0 }
    );
  }, [filteredTransactions]);

  const resetFilters = () => {
    setSearch("");
    setAccountFilter("all");
    setTypeFilter("all");
    setCategoryFilter("all");
    setFromDate("");
    setToDate("");
    setError("");
  };

  const hasActiveFilters =
    search ||
    accountFilter !== "all" ||
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    fromDate ||
    toDate;

  const deleteTransaction = (transactionId) => {
    const confirmed = window.confirm(
      "Delete this transaction from this browser? This action cannot be undone."
    );

    if (!confirmed) return;

    const next = transactions.filter(
      (item) => String(item.id) !== String(transactionId)
    );

    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(next));
      setTransactions(next);
      setError("");
    } catch {
      setError("Unable to save changes in browser storage.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#2563EB]">
              Banking / Transactions
            </p>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Bank Transactions
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Search and review deposits, withdrawals and account activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/bank-statements"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ReceiptText size={17} />
              Bank Statements
            </Link>

            <button
              type="button"
              onClick={() => exportCSV(filteredTransactions)}
              disabled={filteredTransactions.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {/* Summary */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Transactions Found"
            value={filteredTransactions.length}
            icon={<ReceiptText size={20} />}
            color="blue"
          />

          <SummaryCard
            title="Total Credits"
            value={formatMoney(summary.credits)}
            icon={<ArrowDownLeft size={20} />}
            color="emerald"
          />

          <SummaryCard
            title="Total Debits"
            value={formatMoney(summary.debits)}
            icon={<ArrowUpRight size={20} />}
            color="rose"
          />
        </section>

        {/* Transaction History */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Transaction History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Filter transactions by account, type, category and date.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {filteredTransactions.length} records
              </span>
            </div>

            {/* Search */}
            <div className="relative mt-5">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search description, account or reference..."
                aria-label="Search transactions"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Filters */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <FilterSelect
                label="Account"
                value={accountFilter}
                onChange={setAccountFilter}
              >
                <option value="all">All accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={String(account.id)}>
                    {account.accountName || account.bankName || "Account"}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                label="Transaction type"
                value={typeFilter}
                onChange={setTypeFilter}
              >
                <option value="all">All transaction types</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
                <option value="other">Transfers / Others</option>
              </FilterSelect>

              <FilterSelect
                label="Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </FilterSelect>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                  From date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(event) => setFromDate(event.target.value)}
                  aria-label="From date"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                  To date
                </label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                  aria-label="To date"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RefreshCw size={16} />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredTransactions.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0D21A1]">
                <Wallet size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                {transactions.length === 0
                  ? "No bank transactions yet"
                  : "No matching transactions found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {transactions.length === 0
                  ? "Transactions will appear here when you import a bank statement."
                  : "Try changing your search or filters to find transactions."}
              </p>

              {transactions.length === 0 ? (
                <Link
                  to="/bank-statements"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E]"
                >
                  <Download size={17} />
                  Import Bank Statement
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <X size={16} />
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Description</th>
                    <th className="px-5 py-4 font-semibold">Account</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Reference</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Amount
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((transaction) => {
                    const type = getTransactionType(transaction.type);
                    const amount = Math.abs(
                      Number(transaction.amount) || 0
                    );

                    return (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatDate(transaction.date)}
                        </td>

                        <td className="max-w-[240px] px-5 py-4">
                          <p className="truncate font-semibold text-slate-900">
                            {transaction.description || "Bank transaction"}
                          </p>

                          <p className="mt-1 text-xs capitalize text-slate-500">
                            {transaction.type || "Transaction"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {transaction.accountName || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {transaction.category || "Uncategorized"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {transaction.reference || "—"}
                        </td>

                        <td
                          className={`whitespace-nowrap px-5 py-4 text-right font-bold ${
                            type === "credit"
                              ? "text-emerald-700"
                              : type === "debit"
                                ? "text-rose-600"
                                : "text-slate-900"
                          }`}
                        >
                          {type === "credit"
                            ? "+"
                            : type === "debit"
                              ? "−"
                              : ""}
                          {formatMoney(
                            amount,
                            transaction.currency || "INR"
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => deleteTransaction(transaction.id)}
                            title="Delete transaction"
                            aria-label="Delete transaction"
                            className="rounded-lg border border-rose-100 p-2 text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {filteredTransactions.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-xs text-slate-500">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>

              <button
                type="button"
                onClick={() => exportCSV(filteredTransactions)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D21A1] hover:text-[#03045E]"
              >
                <Download size={16} />
                Download filtered records
              </button>
            </div>
          )}
        </section>

        {/* Demo Notice */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <Filter size={18} className="mt-0.5 shrink-0 text-blue-700" />

          <p className="text-xs leading-5 text-slate-600">
            Demo mode: this page reads transactions from browser storage.
            Bank feeds, server synchronization, automatic balance updates
            and statement reconciliation are not connected yet.
          </p>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{title}</p>

        <div className={`rounded-xl p-2.5 ${styles[color]}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 break-words text-2xl font-extrabold text-slate-900">
        {value}
      </p>
    </article>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Filter by ${label}`}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </div>
  );
}
