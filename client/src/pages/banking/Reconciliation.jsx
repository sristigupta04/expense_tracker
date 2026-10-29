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
} from "lucide-react";

const ACCOUNTS_KEY = "expenseTrackerBankAccounts";
const STATEMENTS_KEY = "expenseTrackerBankStatements";
const BANK_TRANSACTIONS_KEY = "expenseTrackerBankTransactions";
const RECONCILIATION_KEY = "expenseTrackerReconciliations";

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getAmount = (transaction) => {
  const amount = Number(transaction.amount) || 0;
  const type = String(transaction.type || "").toLowerCase();

  if (
    type === "debit" ||
    type === "expense" ||
    type === "withdrawal"
  ) {
    return -Math.abs(amount);
  }

  if (
    type === "credit" ||
    type === "income" ||
    type === "deposit"
  ) {
    return Math.abs(amount);
  }

  return amount;
};

const getDescription = (transaction) =>
  String(
    transaction.description ||
      transaction.narration ||
      transaction.title ||
      transaction.merchant ||
      ""
  )
    .trim()
    .toLowerCase();

const getDate = (transaction) =>
  String(transaction.date || transaction.transactionDate || "").slice(0, 10);

const amountsMatch = (a, b) =>
  Math.abs(getAmount(a) - getAmount(b)) < 0.01;

function findMatch(bankTransaction, appTransactions, usedIds) {
  return appTransactions.find((appTransaction) => {
    if (usedIds.has(String(appTransaction.id))) return false;

    const sameDate = getDate(bankTransaction) === getDate(appTransaction);
    const sameAmount = amountsMatch(bankTransaction, appTransaction);

    const bankDescription = getDescription(bankTransaction);
    const appDescription = getDescription(appTransaction);

    const sameDescription =
      !bankDescription ||
      !appDescription ||
      bankDescription === appDescription;

    return sameDate && sameAmount && sameDescription;
  });
}

export default function Reconciliation() {
  const [accounts] = useState(() => readStorage(ACCOUNTS_KEY));
  const [statements] = useState(() => readStorage(STATEMENTS_KEY));
  const [bankTransactions] = useState(() =>
    readStorage(BANK_TRANSACTIONS_KEY)
  );
  const [appTransactions] = useState(() =>
    readStorage("expenseTrackerTransactions")
  );
  const [savedReconciliations, setSavedReconciliations] = useState(() =>
    readStorage(RECONCILIATION_KEY)
  );

  const [accountId, setAccountId] = useState("");
  const [statementId, setStatementId] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedAccount = accounts.find(
    (account) => String(account.id) === String(accountId)
  );

  const availableStatements = useMemo(
    () =>
      statements.filter(
        (statement) =>
          !accountId ||
          String(statement.accountId) === String(accountId)
      ),
    [statements, accountId]
  );

  const accountTransactions = useMemo(
    () =>
      bankTransactions.filter(
        (transaction) =>
          !accountId ||
          String(transaction.accountId) === String(accountId)
      ),
    [bankTransactions, accountId]
  );

  const visibleResults = useMemo(() => {
    if (!results) return [];

    return results.rows.filter((row) => {
      const text = [
        row.bankTransaction?.description,
        row.appTransaction?.description,
        row.bankTransaction?.date,
        row.appTransaction?.date,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || row.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [results, search, filter]);

  const runReconciliation = () => {
    setError("");
    setSuccess("");
    setResults(null);

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

      statementRows = (statement.transactions || []).map((transaction) => ({
        ...transaction,
        accountId: statement.accountId,
      }));
    } else {
      statementRows = accountTransactions;
    }

    if (statementRows.length === 0) {
      setError(
        "No bank transactions found. Import a CSV statement first or choose a statement."
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

      if (match) usedIds.add(String(match.id));

      return {
        id: `${bankTransaction.id || index}-${index}`,
        bankTransaction,
        appTransaction: match || null,
        status: match ? "Matched" : "Unmatched",
      };
    });

    relevantAppTransactions.forEach((appTransaction, index) => {
      if (!usedIds.has(String(appTransaction.id))) {
        rows.push({
          id: `app-${appTransaction.id || index}`,
          bankTransaction: null,
          appTransaction,
          status: "Missing in Bank Statement",
        });
      }
    });

    const matchedCount = rows.filter(
      (row) => row.status === "Matched"
    ).length;

    setResults({
      accountId: account.id,
      accountName: account.accountName,
      statementId: statementId || null,
      rows,
      matchedCount,
      unmatchedCount: rows.filter(
        (row) => row.status === "Unmatched"
      ).length,
      missingCount: rows.filter(
        (row) => row.status === "Missing in Bank Statement"
      ).length,
      createdAt: new Date().toISOString(),
    });
  };

  const saveReconciliation = () => {
    if (!results) return;

    setError("");
    setSuccess("");

    const record = {
      id:
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now()}`,
      accountId: results.accountId,
      accountName: results.accountName,
      statementId: results.statementId,
      matchedCount: results.matchedCount,
      unmatchedCount: results.unmatchedCount,
      missingCount: results.missingCount,
      status:
        results.unmatchedCount === 0 && results.missingCount === 0
          ? "Reconciled"
          : "Needs Review",
      rows: results.rows,
      createdAt: results.createdAt,
      savedAt: new Date().toISOString(),
    };

    try {
      const updated = [record, ...readStorage(RECONCILIATION_KEY)];

      localStorage.setItem(
        RECONCILIATION_KEY,
        JSON.stringify(updated)
      );

      setSavedReconciliations(updated);
      setSuccess("Reconciliation result saved successfully.");
    } catch {
      setError("Could not save reconciliation result.");
    }
  };

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

    const rows = results.rows.map((row) => [
      row.status,
      row.bankTransaction ? getDate(row.bankTransaction) : "",
      row.bankTransaction?.description || "",
      row.bankTransaction ? getAmount(row.bankTransaction) : "",
      row.appTransaction ? getDate(row.appTransaction) : "",
      row.appTransaction?.description || "",
      row.appTransaction ? getAmount(row.appTransaction) : "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "reconciliation-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6">
      <div>
        <Link
          to="/banking"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-700"
        >
          <ArrowLeftRight size={16} />
          Banking Dashboard
        </Link>

        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
          Bank Reconciliation
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Compare imported bank transactions with your expense tracker records.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-semibold">Select account and statement</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
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
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountName} — {account.bankName}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Imported Statement
            </span>
            <select
              value={statementId}
              onChange={(event) => {
                setStatementId(event.target.value);
                setResults(null);
              }}
              className={inputClass}
            >
              <option value="">Use bank transaction records</option>
              {availableStatements.map((statement) => (
                <option key={statement.id} value={statement.id}>
                  {statement.fileName || statement.accountName || "Statement"}{" "}
                  — {statement.transactionCount || 0} transactions
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runReconciliation}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <RefreshCw size={17} />
            Run Reconciliation
          </button>

          <Link
            to="/bank-statements/import"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Import Statement
          </Link>
        </div>

        {accounts.length === 0 && (
          <p className="mt-4 text-sm text-amber-700">
            Add a bank account before starting reconciliation.
          </p>
        )}

        {selectedAccount && (
          <p className="mt-4 text-xs text-slate-500">
            Selected account: {selectedAccount.accountName}
          </p>
        )}
      </section>

      {results && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-semibold">Reconciliation Results</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Match rule: same date, amount and compatible description.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportCSV}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
                >
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={saveReconciliation}
                  className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Save Results
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className={inputClass}
              >
                <option value="All">All results</option>
                <option value="Matched">Matched</option>
                <option value="Unmatched">Unmatched bank entries</option>
                <option value="Missing in Bank Statement">
                  Missing in bank statement
                </option>
              </select>
            </div>

            {visibleResults.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No results match the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Bank Transaction</th>
                      <th className="px-4 py-4">Bank Amount</th>
                      <th className="px-4 py-4">App Transaction</th>
                      <th className="px-4 py-4">App Amount</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleResults.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <StatusBadge status={row.status} />
                        </td>

                        <td className="px-4 py-4">
                          {row.bankTransaction ? (
                            <>
                              <p className="font-medium">
                                {row.bankTransaction.description ||
                                  "Bank transaction"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {getDate(row.bankTransaction)}
                              </p>
                            </>
                          ) : (
                            <span className="text-slate-400">Not found</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-medium">
                          {row.bankTransaction
                            ? formatCurrency(
                                getAmount(row.bankTransaction),
                                selectedAccount?.currency || "INR"
                              )
                            : "—"}
                        </td>

                        <td className="px-4 py-4">
                          {row.appTransaction ? (
                            <>
                              <p className="font-medium">
                                {row.appTransaction.description ||
                                  row.appTransaction.title ||
                                  "App transaction"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {getDate(row.appTransaction)}
                              </p>
                            </>
                          ) : (
                            <span className="text-slate-400">Not found</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-medium">
                          {row.appTransaction
                            ? formatCurrency(
                                getAmount(row.appTransaction),
                                selectedAccount?.currency || "INR"
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Wallet size={21} className="text-blue-700" />
          <h2 className="font-semibold">Recent Reconciliation History</h2>
        </div>

        {savedReconciliations.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No saved reconciliation results yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {savedReconciliations.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">{record.accountName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(
                      record.savedAt || record.createdAt
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-emerald-700">
                    Matched: {record.matchedCount}
                  </span>
                  <span className="text-rose-600">
                    Unmatched:{" "}
                    {(record.unmatchedCount || 0) +
                      (record.missingCount || 0)}
                  </span>
                  <StatusBadge status={record.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-500">
        Note: This reconciliation runs locally in your browser. It compares
        imported statement rows against records stored under
        expenseTrackerTransactions. Results depend on the data available and
        are not verified by your bank.
      </p>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className={`rounded-xl p-2.5 ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const className =
    status === "Matched" || status === "Reconciled"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Unmatched" || status === "Needs Review"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {status}
    </span>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";