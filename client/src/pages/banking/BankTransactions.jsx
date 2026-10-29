
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function exportCSV(transactions) {
  const headers = [
    "Date",
    "Description",
    "Account",
    "Category",
    "Type",
    "Amount",
    "Reference",
  ];

  const rows = transactions.map((transaction) => [
    transaction.date,
    transaction.description,
    transaction.accountName,
    transaction.category,
    transaction.type,
    transaction.amount,
    transaction.reference || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\r\n");

  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" })
  );

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "bank-transactions.csv";
  anchor.click();
  URL.revokeObjectURL(url);
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const text = [
        transaction.description,
        transaction.accountName,
        transaction.category,
        transaction.reference,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesAccount =
        accountFilter === "all" ||
        String(transaction.accountId) === accountFilter;

      const matchesType =
        typeFilter === "all" ||
        String(transaction.type).toLowerCase() === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        transaction.category === categoryFilter;

      const matchesFrom = !fromDate || transaction.date >= fromDate;
      const matchesTo = !toDate || transaction.date <= toDate;

      return (
        matchesSearch &&
        matchesAccount &&
        matchesType &&
        matchesCategory &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [
    transactions,
    search,
    accountFilter,
    typeFilter,
    categoryFilter,
    fromDate,
    toDate,
  ]);

  const categories = [
    ...new Set(transactions.map((item) => item.category).filter(Boolean)),
  ];

  const totalCredits = filteredTransactions.reduce((total, item) => {
    const type = String(item.type).toLowerCase();
    return total + (["credit", "deposit", "income"].includes(type)
      ? Math.abs(Number(item.amount) || 0)
      : 0);
  }, 0);

  const totalDebits = filteredTransactions.reduce((total, item) => {
    const type = String(item.type).toLowerCase();
    return total + (["debit", "withdrawal", "expense"].includes(type)
      ? Math.abs(Number(item.amount) || 0)
      : 0);
  }, 0);

  const resetFilters = () => {
    setSearch("");
    setAccountFilter("all");
    setTypeFilter("all");
    setCategoryFilter("all");
    setFromDate("");
    setToDate("");
  };

  const deleteTransaction = (transactionId) => {
    if (!window.confirm("Delete this transaction from this browser?")) return;

    const next = transactions.filter(
      (item) => String(item.id) !== String(transactionId)
    );

    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(next));
      setTransactions(next);
    } catch {
      window.alert("Unable to save changes in browser storage.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Banking / Transactions
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Bank Transactions
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Search and review deposits, withdrawals and account activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/bank-statements"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Bank Statements
            </Link>
            <button
              type="button"
              onClick={() => exportCSV(filteredTransactions)}
              disabled={filteredTransactions.length === 0}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Transactions found</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {filteredTransactions.length}
            </p>
          </article>
          <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm text-emerald-800">Total credits</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {formatMoney(totalCredits)}
            </p>
          </article>
          <article className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm text-red-800">Total debits</p>
            <p className="mt-2 text-2xl font-bold text-red-700">
              {formatMoney(totalDebits)}
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Transaction history
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Filter transactions by account, type, category and date.
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              Clear filters
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search description or reference..."
              aria-label="Search transactions"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />

            <select
              value={accountFilter}
              onChange={(event) => setAccountFilter(event.target.value)}
              aria-label="Filter by account"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
            >
              <option value="all">All accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={String(account.id)}>
                  {account.accountName || account.bankName}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter by transaction type"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
            >
              <option value="all">All transaction types</option>
              <option value="credit">Credit</option>
              <option value="deposit">Deposit</option>
              <option value="income">Income</option>
              <option value="debit">Debit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              aria-label="From date"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              aria-label="To date"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <div className="text-4xl">↕</div>
              <h3 className="mt-3 font-semibold text-slate-900">
                No transactions found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Transactions will appear here when added or imported.
              </p>
              <Link
                to="/bank-statements"
                className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                View bank statements
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold">Account</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((transaction) => {
                    const type = String(transaction.type || "").toLowerCase();
                    const isCredit = [
                      "credit",
                      "deposit",
                      "income",
                    ].includes(type);

                    const isDebit = [
                      "debit",
                      "withdrawal",
                      "expense",
                    ].includes(type);

                    const amountPrefix = isCredit
                      ? "+"
                      : isDebit
                        ? "−"
                        : "";

                    return (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {transaction.date || "—"}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {transaction.description || "Bank transaction"}
                          </p>
                          <p className="mt-1 text-xs capitalize text-slate-500">
                            {transaction.type || "Transaction"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {transaction.accountName || "—"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {transaction.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {transaction.reference || "—"}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-4 text-right font-bold ${
                            isCredit
                              ? "text-emerald-700"
                              : isDebit
                                ? "text-red-600"
                                : "text-slate-900"
                          }`}
                        >
                          {amountPrefix}
                          {formatMoney(
                            Math.abs(Number(transaction.amount) || 0),
                            transaction.currency || "INR"
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => deleteTransaction(transaction.id)}
                            className="font-semibold text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Demo mode: this page reads transactions from browser storage. Bank
          feeds, server synchronization, automatic balance updates and statement
          reconciliation are not connected yet.
        </p>
      </div>
    </main>
  );
}
