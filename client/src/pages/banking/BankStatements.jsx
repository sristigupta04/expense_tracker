
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const STATEMENTS_KEY = "expenseTrackerBankStatements";
const ACCOUNTS_KEY = "expenseTrackerBankAccounts";

function readStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
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

export default function BankStatements() {
  const [statements, setStatements] = useState(() =>
    readStorage(STATEMENTS_KEY)
  );
  const [accounts] = useState(() => readStorage(ACCOUNTS_KEY));
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredStatements = useMemo(() => {
    return statements.filter((statement) => {
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

      const matchesSearch = searchableText.includes(search.toLowerCase());
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
    });
  }, [statements, accounts, search, accountFilter, fromDate, toDate]);

  const persistStatements = (nextStatements) => {
    localStorage.setItem(STATEMENTS_KEY, JSON.stringify(nextStatements));
    setStatements(nextStatements);
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];

    setMessage("");
    setError("");

    if (!file) return;

    if (!["text/csv", "application/vnd.ms-excel"].includes(file.type) &&
        !file.name.toLowerCase().endsWith(".csv")) {
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

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result || "").replace(/^\uFEFF/, "");
        const lines = text.split(/\r?\n/).filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error("The CSV file has no transaction rows.");
        }

        const rows = lines.map((line) => {
          const values = [];
          let current = "";
          let quoted = false;

          for (let index = 0; index < line.length; index += 1) {
            const character = line[index];

            if (character === '"') {
              if (quoted && line[index + 1] === '"') {
                current += '"';
                index += 1;
              } else {
                quoted = !quoted;
              }
            } else if (character === "," && !quoted) {
              values.push(current.trim());
              current = "";
            } else {
              current += character;
            }
          }

          values.push(current.trim());
          return values;
        });

        const headers = rows[0].map((header) =>
          header.trim().toLowerCase().replace(/[\s_-]+/g, "")
        );

        const dateIndex = headers.findIndex((header) =>
          ["date", "transactiondate", "valuedate"].includes(header)
        );
        const descriptionIndex = headers.findIndex((header) =>
          ["description", "details", "narration", "particulars"].includes(header)
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

        if (dateIndex === -1 || (amountIndex === -1 && debitIndex === -1 && creditIndex === -1)) {
          throw new Error(
            "CSV needs a Date column and an Amount, Debit, or Credit column."
          );
        }

        const transactions = rows.slice(1).map((row, index) => {
          const rawAmount =
            amountIndex !== -1 ? row[amountIndex] : "";

          const debit = debitIndex !== -1
            ? Number(String(row[debitIndex] || "0").replace(/[₹,\s]/g, ""))
            : 0;

          const credit = creditIndex !== -1
            ? Number(String(row[creditIndex] || "0").replace(/[₹,\s]/g, ""))
            : 0;

          const parsedAmount = Number(
            String(rawAmount).replace(/[₹,\s]/g, "")
          );

          const amount =
            amountIndex !== -1
              ? parsedAmount
              : credit > 0
                ? credit
                : -debit;

          const date = row[dateIndex] || "";

          if (!date || !Number.isFinite(amount)) {
            throw new Error(`Invalid date or amount on CSV row ${index + 2}.`);
          }

          return {
            id: `${Date.now()}-${index}`,
            date,
            description:
              descriptionIndex !== -1
                ? row[descriptionIndex] || "Statement transaction"
                : "Statement transaction",
            amount,
          };
        });

        const account = accounts.find(
          (item) => String(item.id) === String(accountFilter)
        ) || accounts[0];

        const dateValues = transactions.map((item) => item.date).sort();

        const statement = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          accountId: account.id,
          accountName: account.accountName || account.bankName || "Bank account",
          fileName: file.name,
          statementDate: new Date().toISOString().slice(0, 10),
          period: `${dateValues[0]} to ${dateValues[dateValues.length - 1]}`,
          transactionCount: transactions.length,
          transactions,
          status: "Imported",
          uploadedAt: new Date().toISOString(),
        };

        persistStatements([statement, ...statements]);
        setMessage(
          `${file.name} imported for ${statement.accountName}. ${transactions.length} rows parsed.`
        );
      } catch (uploadError) {
        setError(uploadError.message || "Unable to read this CSV file.");
      } finally {
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setError("Could not read the selected file.");
      event.target.value = "";
    };

    reader.readAsText(file);
  };

  const downloadCSV = (statement) => {
    const rows = [
      ["Date", "Description", "Amount"],
      ...(statement.transactions || []).map((transaction) => [
        transaction.date,
        transaction.description,
        transaction.amount,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${statement.fileName.replace(/\.csv$/i, "")}-transactions.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const deleteStatement = (statementId) => {
    const confirmed = window.confirm(
      "Delete this imported statement from this browser?"
    );

    if (!confirmed) return;

    try {
      persistStatements(
        statements.filter((statement) => statement.id !== statementId)
      );
      setMessage("Statement removed.");
    } catch {
      setError("Unable to remove this statement.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Banking / Statements
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Bank Statements
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Import CSV statements and review their transaction rows.
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
            + Import CSV statement
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={handleUpload}
            />
          </label>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Imported statements</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {statements.length}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Visible statements</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {filteredStatements.length}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Linked accounts</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {accounts.length}
            </p>
          </article>
        </div>

        {message && (
          <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {message}
          </div>
        )}

        {error && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Statement history
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and filter your imported statements.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search file, bank or account..."
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              aria-label="Search statements"
            />

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
              onChange={(event) => setFromDate(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
              aria-label="From statement date"
            />

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
              aria-label="To statement date"
            />
          </div>

          {filteredStatements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <div className="text-4xl">📄</div>
              <h3 className="mt-3 font-semibold text-slate-900">
                No statements found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Add a bank account and import a CSV statement to get started.
              </p>
              <Link
                to="/bank-accounts/add"
                className="mt-4 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Add bank account
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Statement</th>
                    <th className="px-4 py-3 font-semibold">Account</th>
                    <th className="px-4 py-3 font-semibold">Statement date</th>
                    <th className="px-4 py-3 font-semibold">Transactions</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStatements.map((statement) => (
                    <tr key={statement.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {statement.fileName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {statement.period}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {statement.accountName || "Bank account"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {statement.statementDate || "—"}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {statement.transactionCount || 0}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {statement.status || "Imported"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => downloadCSV(statement)}
                            className="font-semibold text-blue-700 hover:text-blue-900"
                          >
                            Export
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteStatement(statement.id)}
                            className="font-semibold text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Demo mode: CSV rows are parsed and stored locally in this browser.
          This page does not connect to your bank, upload files to a server,
          or automatically reconcile balances. Use only statements you are
          authorized to access.
        </p>
      </div>
    </main>
  );
}
