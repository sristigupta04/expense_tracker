
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Search,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Building2,
  ReceiptText,
  X,
  Eye,
  CalendarDays,
} from "lucide-react";

const STATEMENTS_KEY = "expenseTrackerBankStatements";
const ACCOUNTS_KEY = "expenseTrackerBankAccounts";
const TRANSACTIONS_KEY = "expenseTrackerBankTransactions";

function readStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function formatMoney(value, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch {
    return `₹${(Number(value) || 0).toLocaleString("en-IN")}`;
  }
}

function formatDate(value) {
  if (!value) return "—";

  const text = String(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(text);

  if (Number.isNaN(date.getTime())) return text;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;

      row.push(field.trim());

      if (row.some((value) => value !== "")) {
        rows.push(row);
      }

      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) {
    throw new Error("CSV contains an unclosed quotation mark.");
  }

  row.push(field.trim());

  if (row.some((value) => value !== "")) {
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function parseDate(value) {
  const text = String(value || "").trim();

  if (!text) return "";

  // YYYY-MM-DD or YYYY/MM/DD
  let match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  match = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

  if (match) {
    const [, day, month, year] = match;
    const d = Number(day);
    const m = Number(month);

    if (d < 1 || d > 31 || m < 1 || m > 12) return "";

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseAmount(value) {
  const text = String(value ?? "")
    .trim()
    .replace(/[₹$€£,\s]/g, "");

  if (!text) return 0;

  const isNegative = /^\(.*\)$/.test(text);
  const cleaned = text.replace(/[()]/g, "");

  const number = Number(cleaned);

  if (!Number.isFinite(number)) return null;

  return isNegative ? -Math.abs(number) : number;
}

function escapeCSV(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadCSV(statement) {
  const rows = [
    ["Date", "Description", "Amount", "Type", "Reference"],
    ...(statement.transactions || []).map((transaction) => [
      transaction.date,
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.reference || "",
    ]),
  ];

  const csv = rows
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${String(statement.fileName || "statement").replace(/\.csv$/i, "")}-transactions.csv`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function SummaryCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{title}</p>
        <div className={`rounded-xl p-2.5 ${colors[color]}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-extrabold text-slate-900">
        {value}
      </p>
    </article>
  );
}

export default function BankStatements() {
  const [statements, setStatements] = useState(() =>
    readStorage(STATEMENTS_KEY)
  );

  const [accounts] = useState(() => readStorage(ACCOUNTS_KEY));

  const [transactions, setTransactions] = useState(() =>
    readStorage(TRANSACTIONS_KEY)
  );

  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(
    accounts.length === 1 ? String(accounts[0].id) : ""
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewStatement, setPreviewStatement] = useState(null);

  const fileInputRef = useRef(null);

  const filteredStatements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return statements
      .filter((statement) => {
        const account = accounts.find(
          (item) => String(item.id) === String(statement.accountId)
        );

        const searchableText = [
          statement.fileName,
          statement.accountName,
          account?.accountName,
          account?.bankName,
          statement.period,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchableText.includes(query);

        const matchesAccount =
          accountFilter === "all" ||
          String(statement.accountId) === accountFilter;

        const statementDate = statement.statementDate || "";

        const matchesFrom = !fromDate || statementDate >= fromDate;
        const matchesTo = !toDate || statementDate <= toDate;

        return (
          matchesSearch &&
          matchesAccount &&
          matchesFrom &&
          matchesTo
        );
      })
      .sort((a, b) =>
        String(b.uploadedAt || "").localeCompare(
          String(a.uploadedAt || "")
        )
      );
  }, [statements, accounts, search, accountFilter, fromDate, toDate]);

  const totalTransactions = statements.reduce(
    (total, statement) =>
      total + (Number(statement.transactionCount) || 0),
    0
  );

  const persistStatements = (nextStatements) => {
    localStorage.setItem(
      STATEMENTS_KEY,
      JSON.stringify(nextStatements)
    );
    setStatements(nextStatements);
  };

  const persistTransactions = (nextTransactions) => {
    localStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(nextTransactions)
    );
    setTransactions(nextTransactions);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    setMessage("");
    setError("");

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file. PDF and Excel parsing are not enabled yet.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    if (accounts.length === 0) {
      setError("Please add a bank account before uploading a statement.");
      event.target.value = "";
      return;
    }

    if (!selectedAccount) {
      setError("Please select the bank account for this statement.");
      event.target.value = "";
      return;
    }

    const account = accounts.find(
      (item) => String(item.id) === selectedAccount
    );

    if (!account) {
      setError("Selected bank account was not found.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const text = (await file.text()).replace(/^\uFEFF/, "");
      const rows = parseCSV(text);

      if (rows.length < 2) {
        throw new Error("The CSV file has no transaction rows.");
      }

      const headers = rows[0].map(normalizeHeader);

      const dateIndex = headers.findIndex((header) =>
        ["date", "transactiondate", "valuedate"].includes(header)
      );

      const descriptionIndex = headers.findIndex((header) =>
        [
          "description",
          "details",
          "narration",
          "particulars",
          "remarks",
        ].includes(header)
      );

      const amountIndex = headers.findIndex((header) =>
        ["amount", "transactionamount"].includes(header)
      );

      const debitIndex = headers.findIndex((header) =>
        ["debit", "withdrawal", "withdrawals"].includes(header)
      );

      const creditIndex = headers.findIndex((header) =>
        ["credit", "deposit", "deposits"].includes(header)
      );

      const referenceIndex = headers.findIndex((header) =>
        ["reference", "referenceno", "transactionid", "refno"].includes(header)
      );

      if (
        dateIndex === -1 ||
        (amountIndex === -1 &&
          debitIndex === -1 &&
          creditIndex === -1)
      ) {
        throw new Error(
          "CSV needs a Date column and an Amount, Debit, or Credit column."
        );
      }

      const importedAt = new Date().toISOString();

      const parsedTransactions = rows.slice(1).map((row, index) => {
        const date = parseDate(row[dateIndex]);

        if (!date) {
          throw new Error(
            `Invalid date on CSV row ${index + 2}. Use YYYY-MM-DD or DD-MM-YYYY.`
          );
        }

        let amount;

        if (amountIndex !== -1) {
          amount = parseAmount(row[amountIndex]);

          if (amount === null) {
            throw new Error(
              `Invalid amount on CSV row ${index + 2}.`
            );
          }
        } else {
          const debit =
            debitIndex !== -1
              ? parseAmount(row[debitIndex])
              : 0;

          const credit =
            creditIndex !== -1
              ? parseAmount(row[creditIndex])
              : 0;

          if (debit === null || credit === null) {
            throw new Error(
              `Invalid debit or credit value on CSV row ${index + 2}.`
            );
          }

          amount =
            credit > 0
              ? Math.abs(credit)
              : debit > 0
                ? -Math.abs(debit)
                : 0;
        }

        const type =
          amount > 0
            ? "credit"
            : amount < 0
              ? "debit"
              : "other";

        return {
          id: `statement-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          statementId: `statement-${Date.now()}`,
          accountId: account.id,
          accountName: account.accountName || account.bankName || "Bank account",
          date,
          description:
            (descriptionIndex !== -1
              ? row[descriptionIndex]
              : "") || "Statement transaction",
          amount: Math.abs(amount),
          type,
          category: "Bank Statement",
          currency: account.currency || "INR",
          reference:
            referenceIndex !== -1
              ? row[referenceIndex] || ""
              : "",
          source: "bank-statement",
          importedAt,
        };
      });

      if (parsedTransactions.length === 0) {
        throw new Error("No valid transaction rows found.");
      }

      const statementId = `statement-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const statementTransactions = parsedTransactions.map((item) => ({
        ...item,
        statementId,
      }));

      const dateValues = statementTransactions
        .map((item) => item.date)
        .sort();

      const duplicate = statements.some(
        (item) =>
          String(item.accountId) === String(account.id) &&
          String(item.fileName).toLowerCase() === file.name.toLowerCase()
      );

      if (duplicate) {
        throw new Error(
          "A statement with this filename has already been imported for this account."
        );
      }

      const statement = {
        id: statementId,
        accountId: account.id,
        accountName:
          account.accountName || account.bankName || "Bank account",
        fileName: file.name,
        statementDate: new Date().toISOString().slice(0, 10),
        period: `${dateValues[0]} to ${dateValues[dateValues.length - 1]}`,
        transactionCount: statementTransactions.length,
        transactions: statementTransactions,
        status: "Imported",
        uploadedAt: importedAt,
      };

      const nextStatements = [statement, ...statements];
      const nextTransactions = [
        ...statementTransactions,
        ...transactions,
      ];

      // Roll back the first storage write if the second one fails.
      const previousStatements = localStorage.getItem(STATEMENTS_KEY);
      const previousTransactions = localStorage.getItem(TRANSACTIONS_KEY);

      try {
        localStorage.setItem(
          STATEMENTS_KEY,
          JSON.stringify(nextStatements)
        );

        localStorage.setItem(
          TRANSACTIONS_KEY,
          JSON.stringify(nextTransactions)
        );
      } catch (storageError) {
        try {
          if (previousStatements === null) {
            localStorage.removeItem(STATEMENTS_KEY);
          } else {
            localStorage.setItem(STATEMENTS_KEY, previousStatements);
          }

          if (previousTransactions === null) {
            localStorage.removeItem(TRANSACTIONS_KEY);
          } else {
            localStorage.setItem(TRANSACTIONS_KEY, previousTransactions);
          }
        } catch {
          // Keep the original storage error message.
        }

        throw storageError;
      }

      setStatements(nextStatements);
      setTransactions(nextTransactions);

      setMessage(
        `${file.name} imported successfully for ${statement.accountName}. ${statementTransactions.length} transactions added.`
      );
    } catch (uploadError) {
      setError(uploadError.message || "Unable to read this CSV file.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const deleteStatement = (statementId) => {
    const confirmed = window.confirm(
      "Delete this imported statement and its imported transactions from this browser?"
    );

    if (!confirmed) return;

    const statement = statements.find(
      (item) => String(item.id) === String(statementId)
    );

    if (!statement) return;

    const nextStatements = statements.filter(
      (item) => String(item.id) !== String(statementId)
    );

    const nextTransactions = transactions.filter(
      (item) => String(item.statementId) !== String(statementId)
    );

    const previousStatements = localStorage.getItem(STATEMENTS_KEY);
    const previousTransactions = localStorage.getItem(TRANSACTIONS_KEY);

    try {
      localStorage.setItem(
        STATEMENTS_KEY,
        JSON.stringify(nextStatements)
      );

      localStorage.setItem(
        TRANSACTIONS_KEY,
        JSON.stringify(nextTransactions)
      );

      setStatements(nextStatements);
      setTransactions(nextTransactions);
      setMessage("Statement and its imported transactions were removed.");
      setError("");
    } catch {
      try {
        if (previousStatements === null) {
          localStorage.removeItem(STATEMENTS_KEY);
        } else {
          localStorage.setItem(STATEMENTS_KEY, previousStatements);
        }

        if (previousTransactions === null) {
          localStorage.removeItem(TRANSACTIONS_KEY);
        } else {
          localStorage.setItem(TRANSACTIONS_KEY, previousTransactions);
        }
      } catch {
        // Ignore rollback failure.
      }

      setError("Unable to remove this statement. Please try again.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setAccountFilter("all");
    setFromDate("");
    setToDate("");
  };

  const hasActiveFilters =
    search || accountFilter !== "all" || fromDate || toDate;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#2563EB]">
              Banking / Statements
            </p>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Bank Statements
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Import CSV statements and review your transaction records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || accounts.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#03045E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={18} />
            {uploading ? "Importing..." : "Import CSV Statement"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleUpload}
          />
        </header>

        {/* Messages */}
        {message && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Account Selection and Import */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-[#0D21A1]">
              <FileSpreadsheet size={23} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Import Bank Statement
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select an account before importing its CSV statement.
              </p>
            </div>
          </div>

          {accounts.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <Building2 size={25} className="mx-auto text-slate-400" />

              <p className="mt-3 text-sm font-semibold text-slate-800">
                No bank accounts available
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Add a bank account before importing a statement.
              </p>

              <Link
                to="/bank-accounts/add"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#03045E]"
              >
                <Plus size={16} />
                Add Bank Account
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Bank Account
                </label>

                <select
                  value={selectedAccount}
                  onChange={(event) => setSelectedAccount(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Choose an account</option>

                  {accounts.map((account) => (
                    <option key={account.id} value={String(account.id)}>
                      {account.accountName || account.bankName || "Bank account"}
                      {account.accountNumber
                        ? ` •••• ${account.accountNumber}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedAccount || uploading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#0D21A1] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload size={17} />
                  Choose CSV File
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700">
              Supported CSV columns
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Required: Date and Amount, or Date with Debit/Credit columns.
              Optional: Description, Reference. Maximum file size: 5 MB.
              PDF and Excel files are not supported yet.
            </p>
          </div>
        </section>

        {/* Summary */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Imported Statements"
            value={statements.length}
            icon={<FileSpreadsheet size={20} />}
            color="blue"
          />

          <SummaryCard
            title="Visible Statements"
            value={filteredStatements.length}
            icon={<Eye size={20} />}
            color="violet"
          />

          <SummaryCard
            title="Imported Transactions"
            value={totalTransactions}
            icon={<ReceiptText size={20} />}
            color="emerald"
          />
        </section>

        {/* Statement History */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Statement History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search and filter your imported statements.
                </p>
              </div>

              <Link
                to="/bank-transactions"
                className="text-sm font-semibold text-[#0D21A1] hover:text-[#03045E]"
              >
                View Transactions →
              </Link>
            </div>

            {/* Filters */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search file, bank or account..."
                  aria-label="Search statements"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={accountFilter}
                onChange={(event) => setAccountFilter(event.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
                aria-label="Filter by account"
              >
                <option value="all">All accounts</option>

                {accounts.map((account) => (
                  <option key={account.id} value={String(account.id)}>
                    {account.accountName || account.bankName}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => setFromDate(event.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
                aria-label="From statement date"
              />

              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => setToDate(event.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
                aria-label="To statement date"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#0D21A1] hover:text-[#03045E]"
              >
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>

          {/* Table */}
          {filteredStatements.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0D21A1]">
                <FileSpreadsheet size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                {statements.length === 0
                  ? "No statements imported yet"
                  : "No matching statements found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {statements.length === 0
                  ? "Select a bank account and import your first CSV statement."
                  : "Try changing your search or filters."}
              </p>

              {statements.length > 0 ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset Filters
                </button>
              ) : (
                <Link
                  to="/bank-accounts/add"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#03045E]"
                >
                  <Plus size={16} />
                  Add Bank Account
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4 font-semibold">Statement</th>
                    <th className="px-5 py-4 font-semibold">Account</th>
                    <th className="px-5 py-4 font-semibold">Statement Date</th>
                    <th className="px-5 py-4 font-semibold">Transactions</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStatements.map((statement) => (
                    <tr
                      key={statement.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="max-w-[250px] px-5 py-4">
                        <p className="truncate font-semibold text-slate-900">
                          {statement.fileName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {statement.period || "Period not available"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {statement.accountName || "Bank account"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(statement.statementDate)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {statement.transactionCount || 0}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {statement.status || "Imported"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewStatement(statement)}
                            title="Preview statement"
                            aria-label="Preview statement"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadCSV(statement)}
                            title="Export statement"
                            aria-label="Export statement"
                            className="rounded-lg border border-blue-100 p-2 text-blue-700 transition hover:bg-blue-50"
                          >
                            <Download size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteStatement(statement.id)}
                            title="Delete statement"
                            aria-label="Delete statement"
                            className="rounded-lg border border-rose-100 p-2 text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing {filteredStatements.length} of {statements.length} statements
            </p>

            <Link
              to="/bank-transactions"
              className="text-xs font-semibold text-[#0D21A1] hover:text-[#03045E]"
            >
              Open Bank Transactions →
            </Link>
          </div>
        </section>

        {/* Security Notice */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-xs leading-5 text-slate-600">
            Demo mode: CSV rows are parsed and stored locally in this browser.
            This page does not connect to your bank or upload statements to a
            server. Import only statements you are authorized to access.
          </p>
        </div>
      </div>

      {/* Statement Preview Modal */}
      {previewStatement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewStatement(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="statement-preview-title"
            className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <h2
                  id="statement-preview-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Statement Preview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {previewStatement.fileName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewStatement(null)}
                aria-label="Close preview"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 bg-slate-50 p-5 sm:grid-cols-3">
              <PreviewStat
                label="Account"
                value={previewStatement.accountName || "Bank account"}
              />

              <PreviewStat
                label="Transactions"
                value={previewStatement.transactionCount || 0}
              />

              <PreviewStat
                label="Period"
                value={previewStatement.period || "Not available"}
              />
            </div>

            <div className="max-h-[50vh] overflow-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="sticky top-0 bg-white shadow-sm">
                  <tr className="text-xs uppercase text-slate-500">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {(previewStatement.transactions || []).map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                        {formatDate(transaction.date)}
                      </td>

                      <td className="px-5 py-3 font-medium text-slate-800">
                        {transaction.description || "Transaction"}
                      </td>

                      <td className="px-5 py-3 capitalize text-slate-500">
                        {transaction.type || "Other"}
                      </td>

                      <td
                        className={`whitespace-nowrap px-5 py-3 text-right font-semibold ${
                          transaction.type === "credit"
                            ? "text-emerald-700"
                            : transaction.type === "debit"
                              ? "text-rose-600"
                              : "text-slate-800"
                        }`}
                      >
                        {formatMoney(
                          transaction.amount,
                          transaction.currency || "INR"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setPreviewStatement(null)}
                className="rounded-xl bg-[#0D21A1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#03045E]"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function PreviewStat({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
