
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Wallet,
  CalendarDays,
  Download,
  Clock,
  Hash,
  FileText,
  ShieldCheck,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerReconciliations";

const readReconciliations = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
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

  if (["debit", "expense", "withdrawal"].includes(type)) {
    return -Math.abs(amount);
  }

  if (["credit", "income", "deposit"].includes(type)) {
    return Math.abs(amount);
  }

  return amount;
};

const getDate = (transaction) =>
  String(
    transaction?.date || transaction?.transactionDate || "—"
  ).slice(0, 10);

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ReconciliationDetails() {
  const { id } = useParams();

  const record = useMemo(() => {
    return readReconciliations().find(
      (item) => String(item.id) === String(id)
    );
  }, [id]);

  const rows = Array.isArray(record?.rows) ? record.rows : [];

  const summary = useMemo(() => {
    const matched = rows.filter(
      (row) => row.status === "Matched"
    ).length;

    const unmatched = rows.filter(
      (row) => row.status === "Unmatched"
    ).length;

    const missing = rows.filter(
      (row) => row.status === "Missing in Bank Statement"
    ).length;

    return {
      matched,
      unmatched,
      missing,
      total: rows.length,
    };
  }, [rows]);

  const matchPercentage =
    summary.total > 0
      ? (summary.matched / summary.total) * 100
      : 0;

  // CSV Export
  const exportCSV = () => {
    if (!record) return;

    const escapeCSV = (value) => {
      return `"${String(value ?? "").replace(/"/g, '""')}"`;
    };

    const header = [
      "Status",
      "Bank Date",
      "Bank Description",
      "Bank Amount",
      "App Date",
      "App Description",
      "App Amount",
    ];

    const data = rows.map((row) => [
      row.status || "Unknown",
      row.bankTransaction ? getDate(row.bankTransaction) : "",
      row.bankTransaction?.description || "",
      row.bankTransaction ? getAmount(row.bankTransaction) : "",
      row.appTransaction ? getDate(row.appTransaction) : "",
      row.appTransaction?.description ||
        row.appTransaction?.title ||
        "",
      row.appTransaction ? getAmount(row.appTransaction) : "",
    ]);

    const csv = [header, ...data]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `reconciliation-${record.id}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Record Not Found
  if (!record) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <FileCheck2 size={32} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Reconciliation Not Found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ye record exist nahi karta ya browser storage se remove ho gaya hai.
            </p>

            <Link
              to="/reconciliation"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowLeft size={17} />
              Back to Reconciliation
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              to="/reconciliation"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0D21A1]"
            >
              <ArrowLeft size={17} />
              Back to Reconciliation
            </Link>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Reconciliation Details
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Complete report for {record.accountName || "your bank account"}.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#03045E] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download size={17} />
            Export Report
          </button>
        </header>

        {/* Record Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                <Wallet size={25} />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-lg font-bold text-slate-900">
                  {record.accountName || "Bank Account"}
                </h2>

                <p className="mt-1 break-all text-xs text-slate-500">
                  Reconciliation ID: {record.id}
                </p>

                {record.statementId && (
                  <p className="mt-1 break-all text-xs text-slate-500">
                    Statement ID: {record.statementId}
                  </p>
                )}
              </div>
            </div>

            <StatusBadge status={record.status || "Needs Review"} />
          </div>

          <div className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <InfoItem
              icon={<CalendarDays size={17} />}
              label="Reconciliation Created"
              value={formatDate(record.createdAt)}
            />

            <InfoItem
              icon={<Clock size={17} />}
              label="Saved At"
              value={formatDate(record.savedAt)}
            />
          </div>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Compared"
            value={summary.total}
            icon={<FileCheck2 size={21} />}
            color="blue"
          />

          <SummaryCard
            title="Matched"
            value={summary.matched}
            icon={<CheckCircle2 size={21} />}
            color="emerald"
          />

          <SummaryCard
            title="Unmatched Bank Entries"
            value={summary.unmatched}
            icon={<AlertCircle size={21} />}
            color="amber"
          />

          <SummaryCard
            title="Missing in Statement"
            value={summary.missing}
            icon={<XCircle size={21} />}
            color="rose"
          />
        </section>

        {/* Reconciliation Overview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900">
                Reconciliation Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Matching progress of your transactions.
              </p>
            </div>

            <span className="text-xl font-extrabold text-emerald-700">
              {matchPercentage.toFixed(1)}%
            </span>
          </div>

          {summary.total === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Is record mein transaction details available nahi hain.
            </p>
          ) : (
            <>
              <div
                className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuenow={Number(matchPercentage.toFixed(1))}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Matched transactions percentage"
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
                <span className="text-slate-500">
                  {matchPercentage.toFixed(1)}% matched
                </span>

                <span className="font-semibold text-slate-800">
                  {summary.matched} of {summary.total} records
                </span>
              </div>
            </>
          )}

          <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Matched
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Unmatched
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Missing in Statement
            </span>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Matched records were paired using the reconciliation logic used
            when the report was generated. Review unmatched entries before
            treating the statement as reconciled.
          </p>
        </section>

        {/* Transaction Comparison */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800">
                <FileText size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Transaction Comparison
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Bank statement entries compared with app transactions.
                </p>
              </div>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="p-10 text-center">
              <FileCheck2
                size={35}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                No transaction comparison details saved in this record.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-4 font-semibold">Status</th>
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
                  {rows.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="align-top transition hover:bg-blue-50/30"
                    >
                      <td className="px-4 py-4">
                        <StatusBadge status={row.status} />
                      </td>

                      <td className="px-4 py-4">
                        {row.bankTransaction ? (
                          <>
                            <p className="max-w-xs break-words font-medium text-slate-800">
                              {row.bankTransaction.description ||
                                "Bank transaction"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {getDate(row.bankTransaction)}
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
                          ? formatCurrency(getAmount(row.bankTransaction))
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        {row.appTransaction ? (
                          <>
                            <p className="max-w-xs break-words font-medium text-slate-800">
                              {row.appTransaction.description ||
                                row.appTransaction.title ||
                                "App transaction"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {getDate(row.appTransaction)}
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
                          ? formatCurrency(getAmount(row.appTransaction))
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/reconciliation"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <ArrowLeft size={17} />
            Back to Reconciliation
          </Link>

          <Link
            to="/bank-transactions"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#03045E]"
          >
            <Wallet size={17} />
            View Bank Transactions
          </Link>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-blue-700"
          />

          <p className="text-xs leading-5 text-slate-600">
            This page displays locally saved reconciliation information.
            Always review unmatched entries before considering your records
            reconciled.
          </p>
        </div>
      </div>
    </main>
  );
}

/* Summary Card */
function SummaryCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
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

/* Information Item */
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

/* Status Badge */
function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  const isMatched =
    normalized === "matched" || normalized === "reconciled";

  const isUnmatched =
    normalized === "unmatched" || normalized === "needs review";

  const isPending = normalized === "pending";

  const color = isMatched
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isUnmatched
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : isPending
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${color}`}
    >
      {status || "Unknown"}
    </span>
  );
}
