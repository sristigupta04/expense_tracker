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
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerReconciliations";

const readReconciliations = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
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

export default function ReconciliationDetails() {
  const { id } = useParams();

  const record = useMemo(() => {
    return readReconciliations().find(
      (item) => String(item.id) === String(id)
    );
  }, [id]);

  const rows = record?.rows || [];

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

  const exportCSV = () => {
    if (!record) return;

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

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
      row.status,
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

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `reconciliation-${record.id}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <FileCheck2
            size={40}
            className="mx-auto text-slate-400"
          />

          <h1 className="mt-4 text-xl font-bold">
            Reconciliation not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Ye record exist nahi karta ya browser storage se remove ho gaya hai.
          </p>

          <Link
            to="/reconciliation"
            className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Back to Reconciliation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/reconciliation"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Reconciliation
          </Link>

          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Reconciliation Details
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Complete report for {record.accountName || "your bank account"}.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <Download size={17} />
          Export Report
        </button>
      </div>

      {/* Record information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Wallet size={25} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                {record.accountName || "Bank Account"}
              </h2>

              <p className="mt-1 break-all text-xs text-slate-500">
                Reconciliation ID: {record.id}
              </p>

              {record.statementId && (
                <p className="mt-1 text-xs text-slate-500">
                  Statement ID: {record.statementId}
                </p>
              )}
            </div>
          </div>

          <StatusBadge status={record.status || "Needs Review"} />
        </div>

        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <InfoItem
            icon={<CalendarDays size={17} />}
            label="Reconciliation Created"
            value={formatDate(record.createdAt)}
          />

          <InfoItem
            icon={<CalendarDays size={17} />}
            label="Saved At"
            value={formatDate(record.savedAt)}
          />
        </div>
      </section>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
      </div>

      {/* Result status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Reconciliation Overview</h2>

        {summary.total === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Is record mein transaction details available nahi hain.
          </p>
        ) : (
          <>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${(summary.matched / summary.total) * 100}%`,
                }}
              />
            </div>

            <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-slate-500">
                {((summary.matched / summary.total) * 100).toFixed(1)}% matched
              </span>

              <span className="font-medium text-slate-800">
                {summary.matched} of {summary.total} records
              </span>
            </div>
          </>
        )}

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Matched records were paired using the reconciliation logic used when
          the report was generated. Review unmatched entries before treating
          the statement as reconciled.
        </p>
      </section>

      {/* Transactions */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold">Transaction Comparison</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bank statement entries compared with app transactions.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No transaction comparison details saved in this record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Bank Transaction</th>
                  <th className="px-4 py-4 text-right">Bank Amount</th>
                  <th className="px-4 py-4">App Transaction</th>
                  <th className="px-4 py-4 text-right">App Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="align-top hover:bg-slate-50"
                  >
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

                    <td className="whitespace-nowrap px-4 py-4 text-right font-medium">
                      {row.bankTransaction
                        ? formatCurrency(
                            getAmount(row.bankTransaction)
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

                    <td className="whitespace-nowrap px-4 py-4 text-right font-medium">
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

      <div className="flex flex-wrap gap-3">
        <Link
          to="/reconciliation"
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to Reconciliation
        </Link>

        <Link
          to="/bank-transactions"
          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
        >
          View Bank Transactions
        </Link>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SummaryCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
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

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const color =
    status === "Matched" || status === "Reconciled"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Unmatched" || status === "Needs Review"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${color}`}
    >
      {status || "Unknown"}
    </span>
  );
}