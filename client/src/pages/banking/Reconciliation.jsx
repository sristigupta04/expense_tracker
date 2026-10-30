
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  FileCheck2,
  Wallet,
  XCircle,
  Download,
  Save,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

const ACCOUNTS_KEY = "expenseTrackerBankAccounts";
const STATEMENTS_KEY = "expenseTrackerBankStatements";
const BANK_TRANSACTIONS_KEY = "expenseTrackerBankTransactions";
const RECONCILIATION_KEY = "expenseTrackerReconciliations";
const APP_TRANSACTIONS_KEY = "expenseTrackerTransactions";

const readStorage = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const formatCurrency = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `₹${(Number(amount) || 0).toLocaleString("en-IN")}`;
  }
};

const getAmount = (transaction) => {
  if (!transaction) return 0;

  const amount = Number(transaction.amount) || 0;
  const type = String(transaction.type || "").toLowerCase();

  if (
    ["debit", "expense", "withdrawal"].includes(type)
  ) {
    return -Math.abs(amount);
  }

  if (
    ["credit", "income", "deposit"].includes(type)
  ) {
    return Math.abs(amount);
  }

  return amount;
};

const getDescription = (transaction) =>
  String(
    transaction?.description ||
      transaction?.narration ||
      transaction?.title ||
      transaction?.merchant ||
      ""
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getDate = (transaction) =>
  String(
    transaction?.date ||
      transaction?.transactionDate ||
      ""
  ).slice(0, 10);

const amountsMatch = (a, b) =>
  Math.abs(getAmount(a) - getAmount(b)) < 0.01;

const getTransactionKey = (transaction, index) =>
  transaction?.id != null
    ? String(transaction.id)
    : `transaction-index-${index}`;

function findMatch(bankTransaction, appTransactions, usedIds) {
  const bankDate = getDate(bankTransaction);
  const bankDescription = getDescription(bankTransaction);

  return appTransactions.find((appTransaction, index) => {
    const key = getTransactionKey(appTransaction, index);

    if (usedIds.has(key)) return false;

    const sameDate = bankDate === getDate(appTransaction);
    const sameAmount = amountsMatch(
      bankTransaction,
      appTransaction
    );

    const appDescription = getDescription(appTransaction);

    const sameDescription =
      !bankDescription ||
      !appDescription ||
      bankDescription === appDescription;

    return sameDate && sameAmount && sameDescription;
  });
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Reconciliation() {
  const [accounts] = useState(() => readStorage(ACCOUNTS_KEY));
  const [statements] = useState(() => readStorage(STATEMENTS_KEY));

  const [bankTransactions] = useState(() =>
    readStorage(BANK_TRANSACTIONS_KEY)
  );

  const [appTransactions] = useState(() =>
    readStorage(APP_TRANSACTIONS_KEY)
  );

  const [savedReconciliations, setSavedReconciliations] =
    useState(() => readStorage(RECONCILIATION_KEY));

  const [accountId, setAccountId] = useState("");
  const [statementId, setStatementId] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedAccount = useMemo(
    () =>
      accounts.find(
        (account) => String(account.id) === String(accountId)
      ),
    [accounts, accountId]
  );

  // Available statements for selected account
  const availableStatements = useMemo(
    () =>
      statements.filter(
        (statement) =>
          !accountId ||
          String(statement.accountId) === String(accountId)
      ),
    [statements, accountId]
  );

  // Bank transactions for selected account
  const accountTransactions = useMemo(
    () =>
      bankTransactions.filter(
        (transaction) =>
          !accountId ||
          String(transaction.accountId) === String(accountId)
      ),
    [bankTransactions, accountId]
  );

  // Filter reconciliation results
  const visibleResults = useMemo(() => {
    if (!results) return [];

    return results.rows.filter((row) => {
      const text = [
        row.bankTransaction?.description,
        row.bankTransaction?.narration,
        row.appTransaction?.description,
        row.appTransaction?.title,
        getDate(row.bankTransaction),
        getDate(row.appTransaction),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(
        search.trim().toLowerCase()
      );

      const matchesFilter =
        filter === "All" || row.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [results, search, filter]);

  // Run reconciliation
  const runReconciliation = () => {
    setError("");
    setSuccess("");
    setResults(null);
    setSearch("");
    setFilter("All");

    if (!accountId) {
      setError("Please select a bank account.");
      return;
    }

    const account = accounts.find(
      (item) => String(item.id) === String(accountId)
    );

    if (!account) {
      setError("Selected account was not found.");
      return;
    }

    let statementRows = [];

    if (statementId) {
      const statement = statements.find(
        (item) => String(item.id) === String(statementId)
      );

      if (!statement) {
        setError("Selected statement was not found.");
        return;
      }

      if (
        String(statement.accountId) !== String(accountId)
      ) {
        setError("Selected statement does not belong to this account.");
        return;
      }

      statementRows = Array.isArray(statement.transactions)
        ? statement.transactions.map((transaction) => ({
            ...transaction,
            accountId: statement.accountId,
          }))
        : [];
    } else {
      statementRows = accountTransactions;
    }

    if (statementRows.length === 0) {
      setError(
        "No bank transactions found. Import a CSV statement first or choose another statement."
      );
      return;
    }

    const relevantAppTransactions = appTransactions.filter(
      (transaction) =>
        !transaction.accountId ||
        String(transaction.accountId) === String(accountId)
    );

    const usedIds = new Set();

    const rows = statementRows.map((bankTransaction, index) => {
      const match = findMatch(
        bankTransaction,
        relevantAppTransactions,
        usedIds
      );

      if (match) {
        const matchIndex = relevantAppTransactions.indexOf(match);

        usedIds.add(
          getTransactionKey(match, matchIndex)
        );
      }

      return {
        id: `bank-${bankTransaction.id || index}-${index}`,
        bankTransaction,
        appTransaction: match || null,
        status: match ? "Matched" : "Unmatched",
      };
    });

    // App transactions not present in bank statement
    relevantAppTransactions.forEach((appTransaction, index) => {
      const key = getTransactionKey(appTransaction, index);

      if (!usedIds.has(key)) {
        rows.push({
          id: `app-${key}`,
          bankTransaction: null,
          appTransaction,
          status: "Missing in Bank Statement",
        });
      }
    });

    const matchedCount = rows.filter(
      (row) => row.status === "Matched"
    ).length;

    const unmatchedCount = rows.filter(
      (row) => row.status === "Unmatched"
    ).length;

    const missingCount = rows.filter(
      (row) => row.status === "Missing in Bank Statement"
    ).length;

    setResults({
      accountId: account.id,
      accountName: account.accountName,
      currency: account.currency || "INR",
      statementId: statementId || null,
      rows,
      matchedCount,
      unmatchedCount,
      missingCount,
      createdAt: new Date().toISOString(),
    });
  };

  // Save reconciliation
  const saveReconciliation = () => {
    if (!results || saving) return;

    setError("");
    setSuccess("");
    setSaving(true);

    const record = {
      id:
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      accountId: results.accountId,
      accountName: results.accountName,
      statementId: results.statementId,
      matchedCount: results.matchedCount,
      unmatchedCount: results.unmatchedCount,
      missingCount: results.missingCount,
      status:
        results.unmatchedCount === 0 &&
        results.missingCount === 0
          ? "Reconciled"
          : "Needs Review",
      rows: results.rows,
      createdAt: results.createdAt,
      savedAt: new Date().toISOString(),
    };

    try {
      const existing = readStorage(RECONCILIATION_KEY);

      const updated = [record, ...existing];

      localStorage.setItem(
        RECONCILIATION_KEY,
        JSON.stringify(updated)
      );

      setSavedReconciliations(updated);
      setSuccess("Reconciliation result saved successfully.");
    } catch {
      setError(
        "Could not save reconciliation result. Browser storage may be full."
      );
    } finally {
      setSaving(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (!results) return;

    const header = [
      "Status",
      "Bank Date",
      "Bank Description",
      "Bank Amount",
      "App Date",
      "App Description",
      "App Amount",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvRows = results.rows.map((row) => [
      row.status,
      row.bankTransaction ? getDate(row.bankTransaction) : "",
      row.bankTransaction?.description ||
        row.bankTransaction?.narration ||
        "",
      row.bankTransaction
        ? getAmount(row.bankTransaction)
        : "",
      row.appTransaction ? getDate(row.appTransaction) : "",
      row.appTransaction?.description ||
        row.appTransaction?.title ||
        "",
      row.appTransaction
        ? getAmount(row.appTransaction)
        : "",
    ]);

    const csv = [header, ...csvRows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `reconciliation-${results.accountId}-${Date.now()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page Header */}
        <header>
          <Link
            to="/banking"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0D21A1]"
          >
            <ArrowLeftRight size={16} />
            Banking Dashboard
          </Link>

          <div className="mt-4">
            <p className="text-sm font-semibold text-[#2563EB]">
              Banking / Reconciliation
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Bank Reconciliation
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Compare imported bank transactions with your expense tracker records.
            </p>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 size={19} className="shrink-0" />
            {success}
          </div>
        )}

        {/* Account Selection */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800">
              <Wallet size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Select Account & Statement
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Choose the bank account and imported statement to compare.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            {/* Bank Account */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Bank Account
              </span>

              <select
                value={accountId}
                onChange={(event) => {
                  setAccountId(event.target.value);
                  setStatementId("");
                  setResults(null);
                  setError("");
                  setSuccess("");
                }}
                className={inputClass}
              >
                <option value="">Choose an account</option>

                {accounts.map((account, index) => (
                  <option
                    key={account.id || index}
                    value={account.id}
                  >
                    {account.accountName || "Bank Account"}
                    {account.bankName
                      ? ` — ${account.bankName}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>

            {/* Statement */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Imported Statement
              </span>

              <select
                value={statementId}
                onChange={(event) => {
                  setStatementId(event.target.value);
                  setResults(null);
                  setError("");
                  setSuccess("");
                }}
                disabled={!accountId}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60`}
              >
                <option value="">
                  Use bank transaction records
                </option>

                {availableStatements.map((statement, index) => (
                  <option
                    key={statement.id || index}
                    value={statement.id}
                  >
                    {statement.fileName ||
                      statement.accountName ||
                      "Statement"}
                    {" — "}
                    {statement.transactionCount ??
                      statement.transactions?.length ??
                      0}{" "}
                    transactions
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Account Information */}
          {selectedAccount && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-blue-50/70 p-4 text-xs text-slate-600">
              <span className="font-semibold text-blue-800">
                Selected: {selectedAccount.accountName}
              </span>

              <span>
                Bank: {selectedAccount.bankName || "Not available"}
              </span>

              <span>
                Currency: {selectedAccount.currency || "INR"}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runReconciliation}
              disabled={!accountId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={17} />
              Run Reconciliation
            </button>

            <Link
              to="/bank-statements/import"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <Download size={17} />
              Import Statement
            </Link>
          </div>

          {accounts.length === 0 && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Add a bank account before starting reconciliation.
            </p>
          )}

          {accountId && availableStatements.length === 0 && (
            <p className="mt-3 text-xs text-slate-500">
              No imported statements found for this account. You can use
              available bank transaction records instead.
            </p>
          )}
        </section>

        {/* Reconciliation Results */}
        {results && (
          <>
            {/* Summary Cards */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Matched"
                value={results.matchedCount}
                icon={<CheckCircle2 size={21} />}
                color="emerald"
              />

              <SummaryCard
                title="Unmatched Bank Entries"
                value={results.unmatchedCount}
                icon={<AlertCircle size={21} />}
                color="amber"
              />

              <SummaryCard
                title="Missing in Bank Statement"
                value={results.missingCount}
                icon={<XCircle size={21} />}
                color="rose"
              />

              <SummaryCard
                title="Total Compared"
                value={results.rows.length}
                icon={<FileCheck2 size={21} />}
                color="blue"
              />
            </section>

            {/* Results Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center sm:p-6">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Reconciliation Results
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Match rule: same date, amount and compatible description.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={exportCSV}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>

                  <button
                    type="button"
                    onClick={saveReconciliation}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#03045E] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}

                    {saving ? "Saving..." : "Save Results"}
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search transactions..."
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className={`${inputClass} sm:max-w-[240px]`}
                >
                  <option value="All">All results</option>
                  <option value="Matched">Matched</option>
                  <option value="Unmatched">
                    Unmatched bank entries
                  </option>
                  <option value="Missing in Bank Statement">
                    Missing in bank statement
                  </option>
                </select>
              </div>

              {/* Results Table */}
              {visibleResults.length === 0 ? (
                <div className="p-10 text-center">
                  <Search
                    size={32}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No results match the selected filters.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try changing your search or filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-4 font-semibold">
                          Status
                        </th>

                        <th className="px-4 py-4 font-semibold">
                          Bank Transaction
                        </th>

                        <th className="px-4 py-4 text-right font-semibold">
                          Bank Amount
                        </th>

                        <th className="px-4 py-4 font-semibold">
                          App Transaction
                        </th>

                        <th className="px-4 py-4 text-right font-semibold">
                          App Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {visibleResults.map((row) => (
                        <tr
                          key={row.id}
                          className="align-top transition hover:bg-blue-50/30"
                        >
                          <td className="px-4 py-4">
                            <StatusBadge status={row.status} />
                          </td>

                          <td className="px-4 py-4">
                            {row.bankTransaction ? (
                              <>
                                <p className="max-w-xs break-words font-semibold text-slate-800">
                                  {row.bankTransaction.description ||
                                    row.bankTransaction.narration ||
                                    "Bank transaction"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDate(getDate(row.bankTransaction))}
                                </p>
                              </>
                            ) : (
                              <span className="text-slate-400">
                                Not found
                              </span>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-slate-800">
                            {row.bankTransaction
                              ? formatCurrency(
                                  getAmount(row.bankTransaction),
                                  results.currency
                                )
                              : "—"}
                          </td>

                          <td className="px-4 py-4">
                            {row.appTransaction ? (
                              <>
                                <p className="max-w-xs break-words font-semibold text-slate-800">
                                  {row.appTransaction.description ||
                                    row.appTransaction.title ||
                                    "App transaction"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDate(getDate(row.appTransaction))}
                                </p>
                              </>
                            ) : (
                              <span className="text-slate-400">
                                Not found
                              </span>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-slate-800">
                            {row.appTransaction
                              ? formatCurrency(
                                  getAmount(row.appTransaction),
                                  results.currency
                                )
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                Showing {visibleResults.length} of {results.rows.length} records
              </div>
            </section>
          </>
        )}

        {/* Saved History */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Recent Reconciliation History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Previously saved reconciliation reports.
              </p>
            </div>
          </div>

          {savedReconciliations.length === 0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">
              <FileCheck2
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No saved reconciliation results yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {savedReconciliations.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-blue-100 hover:bg-blue-50/20 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-800">
                      {record.accountName || "Bank Account"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(
                        record.savedAt || record.createdAt
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-semibold text-emerald-700">
                      Matched: {record.matchedCount || 0}
                    </span>

                    <span className="font-semibold text-rose-600">
                      Unmatched:{" "}
                      {(record.unmatchedCount || 0) +
                        (record.missingCount || 0)}
                    </span>

                    <StatusBadge status={record.status} />

                    <Link
                      to={`/reconciliation/${record.id}`}
                      className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-blue-700"
          />

          <p className="text-xs leading-5 text-slate-600">
            This reconciliation runs locally in your browser. It compares
            imported statement rows against records stored under
            expenseTrackerTransactions. Results depend on available data
            and are not verified by your bank.
          </p>
        </div>
      </div>
    </main>
  );
}

/* Summary Card */
function SummaryCard({ title, value, icon, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className={`rounded-xl p-2.5 ${colors[color] || colors.blue}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-extrabold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* Status Badge */
function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  const color =
    normalized === "matched" || normalized === "reconciled"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "unmatched" || normalized === "needs review"
        ? "bg-amber-50 text-amber-700"
        : normalized === "pending"
          ? "bg-blue-50 text-blue-700"
          : "bg-rose-50 text-rose-700";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {status || "Unknown"}
    </span>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
