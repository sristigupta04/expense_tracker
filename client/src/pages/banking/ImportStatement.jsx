
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  RefreshCw,
} from "lucide-react";

const STATEMENTS_KEY = "expenseTrackerBankStatements";
const ACCOUNTS_KEY = "expenseTrackerBankAccounts";
const TRANSACTIONS_KEY = "expenseTrackerBankTransactions";

const readStorage = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const getId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeHeader = (value) =>
  String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const parseCSVRows = (text) => {
  const rows = [];
  let row = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"' && insideQuotes && text[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(current.trim());
      current = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {
      if (char === "\r" && text[i + 1] === "\n") i++;

      row.push(current.trim());

      if (row.some((value) => value !== "")) {
        rows.push(row);
      }

      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (insideQuotes) {
    throw new Error("CSV file mein quotation marks properly closed nahi hain.");
  }

  row.push(current.trim());

  if (row.some((value) => value !== "")) {
    rows.push(row);
  }

  return rows;
};

const parseAmount = (value) => {
  const cleaned = String(value ?? "")
    .replace(/[₹$,\s]/g, "")
    .replace(/[()]/g, (char) => char === "(" ? "-" : "");

  if (!cleaned) return 0;

  const amount = Number(cleaned);

  if (!Number.isFinite(amount)) return NaN;

  return amount;
};

const normalizeDate = (value) => {
  const input = String(value || "").trim();

  if (!input) return null;

  // YYYY-MM-DD
  const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      return null;
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const indianMatch = input.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
  );

  if (indianMatch) {
    const [, day, month, year] = indianMatch;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      return null;
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(input);

  if (Number.isNaN(parsed.getTime())) return null;

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
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

export default function ImportStatement() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [accountId, setAccountId] = useState("");

  const [accounts] = useState(() => readStorage(ACCOUNTS_KEY));

  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [duplicateWarning, setDuplicateWarning] = useState("");

  // Parse CSV
  const parseCSV = (text) => {
    const rows = parseCSVRows(text);

    if (rows.length < 2) {
      throw new Error(
        "CSV file mein header aur kam se kam ek transaction hona chahiye."
      );
    }

    const headers = rows[0].map(normalizeHeader);

    const findColumn = (...names) =>
      headers.findIndex((header) => names.includes(header));

    const dateIndex = findColumn(
      "date",
      "transactiondate",
      "valuedate",
      "postingdate"
    );

    const descriptionIndex = findColumn(
      "description",
      "narration",
      "details",
      "particulars",
      "merchant",
      "remarks"
    );

    const amountIndex = findColumn(
      "amount",
      "transactionamount"
    );

    const debitIndex = findColumn(
      "debit",
      "withdrawal",
      "withdrawals",
      "dr"
    );

    const creditIndex = findColumn(
      "credit",
      "deposit",
      "deposits",
      "cr"
    );

    const typeIndex = findColumn(
      "type",
      "transactiontype",
      "transactionmode"
    );

    if (dateIndex === -1) {
      throw new Error("CSV mein Date column required hai.");
    }

    if (
      amountIndex === -1 &&
      debitIndex === -1 &&
      creditIndex === -1
    ) {
      throw new Error(
        "CSV mein Amount ya Debit/Credit columns required hain."
      );
    }

    const transactionRows = rows.slice(1);

    const parsedRows = transactionRows.map((values, index) => {
      const rowNumber = index + 2;

      const date = normalizeDate(values[dateIndex]);

      if (!date) {
        throw new Error(
          `Row ${rowNumber}: valid date required. Use YYYY-MM-DD or DD/MM/YYYY.`
        );
      }

      const description =
        descriptionIndex >= 0
          ? values[descriptionIndex] || "Bank transaction"
          : "Bank transaction";

      let amount = 0;
      let type = "debit";

      if (amountIndex >= 0) {
        const rawAmount = parseAmount(values[amountIndex]);

        if (!Number.isFinite(rawAmount)) {
          throw new Error(`Row ${rowNumber}: invalid amount.`);
        }

        const transactionType = String(
          typeIndex >= 0 ? values[typeIndex] || "" : ""
        ).toLowerCase();

        const isDebit =
          rawAmount < 0 ||
          /debit|withdrawal|expense|dr/.test(transactionType);

        amount = Math.abs(rawAmount);
        type = isDebit ? "debit" : "credit";
      } else {
        const debit = parseAmount(values[debitIndex]);
        const credit = parseAmount(values[creditIndex]);

        if (
          !Number.isFinite(debit) ||
          !Number.isFinite(credit)
        ) {
          throw new Error(
            `Row ${rowNumber}: invalid debit or credit amount.`
          );
        }

        if (debit < 0 || credit < 0) {
          throw new Error(
            `Row ${rowNumber}: debit/credit values must not be negative.`
          );
        }

        if (debit > 0 && credit > 0) {
          throw new Error(
            `Row ${rowNumber}: debit aur credit dono filled hain.`
          );
        }

        amount = debit > 0 ? debit : credit;
        type = debit > 0 ? "debit" : "credit";
      }

      if (amount <= 0 || !Number.isFinite(amount)) {
        throw new Error(
          `Row ${rowNumber}: transaction amount zero se greater hona chahiye.`
        );
      }

      return {
        date,
        description,
        amount,
        type,
      };
    });

    return parsedRows;
  };

  // Select and read file
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setSuccess("");
    setDuplicateWarning("");
    setPreview([]);
    setFile(null);

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Abhi sirf CSV files supported hain.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size 5 MB se kam honi chahiye.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size === 0) {
      setError("Selected CSV file empty hai.");
      event.target.value = "";
      return;
    }

    try {
      const text = await selectedFile.text();
      const parsedRows = parseCSV(text);

      setFile(selectedFile);
      setPreview(parsedRows);
    } catch (err) {
      setError(err.message || "CSV file read nahi ho payi.");
      event.target.value = "";
    }
  };

  // Import transactions
  const handleImport = () => {
    setError("");
    setSuccess("");
    setDuplicateWarning("");

    if (!file || preview.length === 0) {
      setError("Pehle valid CSV file select karo.");
      return;
    }

    if (!accountId) {
      setError("Bank account select karna required hai.");
      return;
    }

    const account = accounts.find(
      (item) => String(item.id) === String(accountId)
    );

    if (!account) {
      setError("Selected bank account nahi mila.");
      return;
    }

    setLoading(true);

    try {
      const savedStatements = readStorage(STATEMENTS_KEY);
      const savedTransactions = readStorage(TRANSACTIONS_KEY);

      const duplicate = savedStatements.some(
        (statement) =>
          String(statement.accountId) === String(account.id) &&
          statement.fileName === file.name
      );

      if (duplicate) {
        setDuplicateWarning(
          "Is account mein same filename ka statement pehle import ho chuka hai. Duplicate import avoid karne ke liye import cancel kar diya gaya."
        );
        setLoading(false);
        return;
      }

      const statementId = getId();
      const importedAt = new Date().toISOString();

      const importedTransactions = preview.map((row, index) => ({
        id: `${statementId}-${index + 1}`,
        accountId: account.id,
        accountName: account.accountName,
        statementId,
        date: row.date,
        description: row.description,
        amount: row.amount,
        type: row.type,
        source: "statement_import",
        createdAt: importedAt,
      }));

      const statement = {
        id: statementId,
        accountId: account.id,
        accountName: account.accountName,
        fileName: file.name,
        transactionCount: importedTransactions.length,
        transactions: preview,
        importedAt,
        status: "Imported",
      };

      // Save both collections together as safely as localStorage allows.
      const previousTransactions = localStorage.getItem(
        TRANSACTIONS_KEY
      );

      const previousStatements = localStorage.getItem(
        STATEMENTS_KEY
      );

      try {
        localStorage.setItem(
          TRANSACTIONS_KEY,
          JSON.stringify([
            ...savedTransactions,
            ...importedTransactions,
          ])
        );

        localStorage.setItem(
          STATEMENTS_KEY,
          JSON.stringify([
            ...savedStatements,
            statement,
          ])
        );
      } catch (storageError) {
        // Roll back first write if second write fails.
        if (previousTransactions === null) {
          localStorage.removeItem(TRANSACTIONS_KEY);
        } else {
          localStorage.setItem(
            TRANSACTIONS_KEY,
            previousTransactions
          );
        }

        if (previousStatements === null) {
          localStorage.removeItem(STATEMENTS_KEY);
        } else {
          localStorage.setItem(
            STATEMENTS_KEY,
            previousStatements
          );
        }

        throw storageError;
      }

      setSuccess(
        `${importedTransactions.length} transactions imported successfully.`
      );

      setPreview([]);
      setFile(null);

      window.setTimeout(() => {
        navigate("/bank-transactions");
      }, 1200);
    } catch {
      setError(
        "Import save nahi ho paya. Browser storage check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  // Download CSV template
  const downloadTemplate = () => {
    const csv = [
      "Date,Description,Amount,Type",
      "2026-10-01,Salary,25000,credit",
      "2026-10-02,Groceries,1200,debit",
      "2026-10-03,Electricity Bill,1800,debit",
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "bank-statement-template.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const clearPreview = () => {
    setFile(null);
    setPreview([]);
    setError("");
    setSuccess("");
    setDuplicateWarning("");
  };

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header>
          <Link
            to="/bank-statements"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0D21A1]"
          >
            <ArrowLeft size={17} />
            Back to Bank Statements
          </Link>

          <div className="mt-4">
            <p className="text-sm font-semibold text-[#2563EB]">
              Banking / Statements
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Import Bank Statement
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Upload a CSV statement, preview transactions and import
              them into your tracker.
            </p>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle size={19} className="mt-0.5 shrink-0" />
            {success}
          </div>
        )}

        {duplicateWarning && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            {duplicateWarning}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          <div className="space-y-6">

            {/* Account Selection */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-800">
                  1
                </div>

                <div>
                  <h2 className="font-bold">Select Bank Account</h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Choose the account associated with this statement.
                  </p>
                </div>
              </div>

              <select
                value={accountId}
                onChange={(event) => {
                  setAccountId(event.target.value);
                  setError("");
                  setSuccess("");
                  setDuplicateWarning("");
                }}
                className={inputClass + " mt-5"}
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

              {accounts.length === 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  No bank accounts found. Add a bank account before importing.
                  <Link
                    to="/bank-accounts/add"
                    className="ml-1 font-semibold underline"
                  >
                    Add account
                  </Link>
                </div>
              )}
            </section>

            {/* File Upload */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-800">
                  2
                </div>

                <div>
                  <h2 className="font-bold">Upload CSV File</h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Upload your bank statement in CSV format.
                  </p>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 px-5 py-10 text-center transition hover:border-blue-500 hover:bg-blue-50/40">
                <div className="rounded-xl bg-blue-50 p-4 text-blue-700">
                  <Upload size={27} />
                </div>

                <span className="mt-4 font-semibold text-slate-800">
                  {file ? file.name : "Choose a CSV file"}
                </span>

                <span className="mt-2 text-sm text-slate-500">
                  CSV format only · Maximum 5 MB
                </span>

                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Required: Date and Amount, or Date and Debit/Credit.
                </p>

                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
                >
                  <Download size={16} />
                  Download CSV Template
                </button>
              </div>
            </section>

            {/* Preview */}
            {preview.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                        <FileSpreadsheet size={19} />
                      </div>

                      <h2 className="font-bold">
                        3. Preview Transactions
                      </h2>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {preview.length} transactions ready to import
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    CSV Preview
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Date</th>
                        <th className="px-5 py-3 font-semibold">Description</th>
                        <th className="px-5 py-3 font-semibold">Type</th>
                        <th className="px-5 py-3 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {preview.slice(0, 100).map((row, index) => (
                        <tr
                          key={index}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                            {row.date}
                          </td>

                          <td className="max-w-xs break-words px-5 py-3 font-medium text-slate-800">
                            {row.description}
                          </td>

                          <td className="px-5 py-3">
                            <span
                              className={
                                row.type === "credit"
                                  ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                                  : "rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700"
                              }
                            >
                              {row.type}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-3 text-right font-semibold">
                            {formatCurrency(
                              row.amount,
                              accounts.find(
                                (account) =>
                                  String(account.id) === String(accountId)
                              )?.currency || "INR"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {preview.length > 100 && (
                  <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                    Showing first 100 of {preview.length} transactions.
                    All valid rows will be imported.
                  </p>
                )}

                <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={clearPreview}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <X size={16} />
                    Clear Preview
                  </button>

                  <button
                    type="button"
                    disabled={loading || !accountId}
                    onClick={handleImport}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw size={17} className="animate-spin" />
                    ) : (
                      <FileSpreadsheet size={17} />
                    )}

                    {loading ? "Importing..." : "Import Transactions"}
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* CSV Guide */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">CSV Format Guide</h2>

            <p className="mt-2 text-sm leading-5 text-slate-500">
              Your CSV should contain a header row with supported columns.
            </p>

            <div className="mt-5 space-y-3 text-sm">
              <GuideItem
                title="Date"
                example="2026-10-01"
              />

              <GuideItem
                title="Description"
                example="Grocery shopping"
              />

              <GuideItem
                title="Amount + Type"
                example="1200, debit"
              />

              <GuideItem
                title="Debit / Credit"
                example="Debit: 1200, Credit: 0"
              />
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
              <strong>Important:</strong> CSV files are imported into
              this browser's local storage. This page does not connect
              to your bank or verify transactions with the bank.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function GuideItem({ title, example }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500">
        Example: {example}
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
