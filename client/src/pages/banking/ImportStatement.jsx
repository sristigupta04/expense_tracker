import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";

const STATEMENTS_KEY = "expenseTrackerBankStatements";
const ACCOUNTS_KEY = "expenseTrackerBankAccounts";
const TRANSACTIONS_KEY = "expenseTrackerBankTransactions";

export default function ImportStatement() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [accountId, setAccountId] = useState("");
  const [accounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);

    if (lines.length < 2) {
      throw new Error("CSV file mein header aur kam se kam ek transaction hona chahiye.");
    }

    const parseRow = (line) => {
      const result = [];
      let current = "";
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && line[i + 1] === '"' && insideQuotes) {
          current += '"';
          i++;
        } else if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]).map((header) =>
      header.toLowerCase().replace(/[\s_-]+/g, "")
    );

    const findColumn = (...names) =>
      headers.findIndex((header) => names.includes(header));

    const dateIndex = findColumn("date", "transactiondate", "valuedate");
    const descriptionIndex = findColumn(
      "description",
      "narration",
      "details",
      "particulars",
      "merchant"
    );
    const amountIndex = findColumn("amount", "transactionamount");
    const debitIndex = findColumn("debit", "withdrawal", "withdrawals");
    const creditIndex = findColumn("credit", "deposit", "deposits");
    const typeIndex = findColumn("type", "transactiontype");

    if (dateIndex === -1) {
      throw new Error("CSV mein Date column required hai.");
    }

    if (amountIndex === -1 && debitIndex === -1 && creditIndex === -1) {
      throw new Error(
        "CSV mein Amount ya Debit/Credit columns required hain."
      );
    }

    const rows = lines.slice(1).filter((line) => line.trim());

    return rows.map((line, index) => {
      const values = parseRow(line);

      const date = values[dateIndex] || "";
      const description =
        descriptionIndex >= 0
          ? values[descriptionIndex] || "Bank transaction"
          : "Bank transaction";

      let amount = 0;
      let type = "debit";

      if (amountIndex >= 0) {
        const rawAmount = Number(
          (values[amountIndex] || "0").replace(/[₹$,\s]/g, "")
        );

        if (!Number.isFinite(rawAmount)) {
          throw new Error(`Row ${index + 2}: invalid amount.`);
        }

        amount = Math.abs(rawAmount);
        type =
          rawAmount < 0 ||
          (typeIndex >= 0 &&
            /debit|withdrawal|expense/i.test(values[typeIndex]))
            ? "debit"
            : "credit";
      } else {
        const debit = Number(
          (values[debitIndex] || "0").replace(/[₹$,\s]/g, "")
        );
        const credit = Number(
          (values[creditIndex] || "0").replace(/[₹$,\s]/g, "")
        );

        if (!Number.isFinite(debit) || !Number.isFinite(credit)) {
          throw new Error(`Row ${index + 2}: invalid debit or credit.`);
        }

        if (debit > 0 && credit > 0) {
          throw new Error(
            `Row ${index + 2}: debit aur credit dono filled hain.`
          );
        }

        amount = debit > 0 ? debit : credit;
        type = debit > 0 ? "debit" : "credit";
      }

      if (!date || Number.isNaN(Date.parse(date))) {
        throw new Error(`Row ${index + 2}: valid date required.`);
      }

      if (amount < 0 || !Number.isFinite(amount)) {
        throw new Error(`Row ${index + 2}: invalid transaction amount.`);
      }

      return {
        date,
        description,
        amount,
        type,
      };
    });
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setSuccess("");
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

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);

      setFile(selectedFile);
      setPreview(rows);
    } catch (err) {
      setError(err.message || "CSV file read nahi ho payi.");
      event.target.value = "";
    }
  };

  const handleImport = () => {
    setError("");
    setSuccess("");

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
      const savedStatements = JSON.parse(
        localStorage.getItem(STATEMENTS_KEY) || "[]"
      );

      const savedTransactions = JSON.parse(
        localStorage.getItem(TRANSACTIONS_KEY) || "[]"
      );

      const statementId =
        globalThis.crypto?.randomUUID?.() || String(Date.now());

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

      localStorage.setItem(
        TRANSACTIONS_KEY,
        JSON.stringify([...savedTransactions, ...importedTransactions])
      );

      localStorage.setItem(
        STATEMENTS_KEY,
        JSON.stringify([...savedStatements, statement])
      );

      setSuccess(`${importedTransactions.length} transactions imported successfully.`);
      setPreview([]);
      setFile(null);

      window.setTimeout(() => {
        navigate("/bank-transactions");
      }, 1000);
    } catch {
      setError("Import save nahi ho paya. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = [
      "Date,Description,Amount,Type",
      "2026-10-01,Salary,25000,credit",
      "2026-10-02,Groceries,1200,debit",
    ].join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "bank-statement-template.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6">
      <div>
        <Link
          to="/bank-statements"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Bank Statements
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Import Bank Statement
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Upload a CSV statement, preview transactions and import them into your tracker.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle size={19} className="shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle size={19} className="shrink-0" />
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold">1. Select Bank Account</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose the account associated with this statement.
            </p>

            <select
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Choose an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountName} — {account.bankName}
                </option>
              ))}
            </select>

            {accounts.length === 0 && (
              <p className="mt-3 text-sm text-amber-700">
                No bank accounts found. Add a bank account before importing.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold">2. Upload CSV File</h2>

            <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 px-5 py-10 text-center transition hover:border-blue-500 hover:bg-blue-50/40">
              <div className="rounded-xl bg-blue-50 p-4 text-blue-700">
                <Upload size={27} />
              </div>

              <span className="mt-4 font-semibold">
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
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                <Download size={16} />
                Download CSV Template
              </button>
            </div>
          </section>

          {preview.length > 0 && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div>
                  <h2 className="font-semibold">3. Preview Transactions</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {preview.length} transactions ready to import
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  CSV Preview
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {preview.slice(0, 100).map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-3">
                          {row.date}
                        </td>
                        <td className="px-5 py-3">{row.description}</td>
                        <td className="px-5 py-3">
                          <span
                            className={
                              row.type === "credit"
                                ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                                : "rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"
                            }
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right font-medium">
                          {formatAmount(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {preview.length > 100 && (
                <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                  Showing first 100 of {preview.length} transactions. All valid rows will be imported.
                </p>
              )}

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear Preview
                </button>

                <button
                  type="button"
                  disabled={loading || !accountId}
                  onClick={handleImport}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileSpreadsheet size={17} />
                  {loading ? "Importing..." : "Import Transactions"}
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">CSV Format Guide</h2>

          <p className="mt-2 text-sm text-slate-500">
            Your CSV should contain a header row with these columns.
          </p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-medium">Date</p>
              <p className="mt-1 text-xs text-slate-500">
                Example: 2026-10-01
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-medium">Description</p>
              <p className="mt-1 text-xs text-slate-500">
                Example: Grocery shopping
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-medium">Amount + Type</p>
              <p className="mt-1 text-xs text-slate-500">
                Example: 1200, debit
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            <strong>Important:</strong> CSV files are imported into this browser's local storage. This page does not connect to your bank or verify transactions with the bank.
          </div>
        </aside>
      </div>
    </div>
  );
}