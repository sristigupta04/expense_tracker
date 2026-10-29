import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeftRight,
  Eye,
  Search,
  Filter,
  FileSearch,
} from "lucide-react";
import { useMemo, useState } from "react";

const formatCurrency = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  }
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusConfig = {
  matched: {
    label: "Matched",
    icon: CheckCircle2,
    styles: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  unmatched: {
    label: "Unmatched",
    icon: AlertCircle,
    styles: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  "bank-only": {
    label: "Bank Only",
    icon: XCircle,
    styles: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  "app-only": {
    label: "App Only",
    icon: FileSearch,
    styles: "bg-blue-50 text-blue-700 ring-blue-200",
  },
};

const normalizeStatus = (transaction) => {
  const rawStatus = String(
    transaction.matchStatus || transaction.reconciliationStatus || transaction.status || ""
  )
    .toLowerCase()
    .replace(/_/g, "-")
    .trim();

  if (["matched", "reconciled", "match"].includes(rawStatus)) {
    return "matched";
  }

  if (["bank-only", "bank only", "missing-in-app"].includes(rawStatus)) {
    return "bank-only";
  }

  if (["app-only", "app only", "missing-in-bank"].includes(rawStatus)) {
    return "app-only";
  }

  if (["unmatched", "pending", "discrepancy"].includes(rawStatus)) {
    return "unmatched";
  }

  return "unmatched";
};

const getBankAmount = (transaction) =>
  Number(
    transaction.bankAmount ??
      transaction.statementAmount ??
      transaction.bankTransaction?.amount ??
      0
  );

const getAppAmount = (transaction) =>
  Number(
    transaction.appAmount ??
      transaction.transactionAmount ??
      transaction.appTransaction?.amount ??
      0
  );

export default function ReconciliationTable({
  transactions = [],
  currency = "INR",
  onView,
  onMarkMatched,
  loading = false,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const status = normalizeStatus(transaction);

      const description =
        transaction.description ||
        transaction.narration ||
        transaction.merchant ||
        "";

      const reference =
        transaction.referenceNumber ||
        transaction.reference ||
        transaction.id ||
        "";

      const matchesSearch =
        !query ||
        String(description).toLowerCase().includes(query) ||
        String(reference).toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  const matchedCount = filteredTransactions.filter(
    (transaction) => normalizeStatus(transaction) === "matched"
  ).length;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-14 rounded-lg bg-slate-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Reconciliation Transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Compare bank statement entries against app records.
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {matchedCount} matched
          </div>
        </div>

        {/* Search and filter */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search description or reference..."
              aria-label="Search reconciliation transactions"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="relative">
            <Filter
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by reconciliation status"
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">All statuses</option>
              <option value="matched">Matched</option>
              <option value="unmatched">Unmatched</option>
              <option value="bank-only">Bank Only</option>
              <option value="app-only">App Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / empty state */}
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <FileSearch size={25} />
          </div>

          <h3 className="mt-4 font-bold text-slate-900">
            No transactions found
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try another search term or select a different reconciliation status.
          </p>

          {(search || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Transaction
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bank Amount
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    App Amount
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Difference
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((transaction, index) => {
                  const status = normalizeStatus(transaction);
                  const config = statusConfig[status];
                  const StatusIcon = config.icon;

                  const bankAmount = getBankAmount(transaction);
                  const appAmount = getAppAmount(transaction);
                  const difference = bankAmount - appAmount;

                  const description =
                    transaction.description ||
                    transaction.narration ||
                    transaction.merchant ||
                    "Transaction";

                  const id = transaction.id ?? transaction._id ?? index;

                  return (
                    <tr
                      key={id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.styles}`}>
                            <StatusIcon size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[230px] truncate text-sm font-semibold text-slate-800">
                              {description}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Ref:{" "}
                              {transaction.referenceNumber ||
                                transaction.reference ||
                                id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          transaction.date ||
                            transaction.transactionDate ||
                            transaction.createdAt
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-700">
                        {status === "app-only"
                          ? "—"
                          : formatCurrency(bankAmount, currency)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-700">
                        {status === "bank-only"
                          ? "—"
                          : formatCurrency(appAmount, currency)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <span className={`text-sm font-bold ${
                          Math.abs(difference) < 0.01
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}>
                          {formatCurrency(Math.abs(difference), currency)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge config={config} />
                      </td>

                      <td className="px-5 py-4">
                        <ActionButtons
                          transaction={transaction}
                          status={status}
                          onView={onView}
                          onMarkMatched={onMarkMatched}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Responsive mobile/tablet cards */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {filteredTransactions.map((transaction, index) => {
              const status = normalizeStatus(transaction);
              const config = statusConfig[status];
              const bankAmount = getBankAmount(transaction);
              const appAmount = getAppAmount(transaction);
              const difference = bankAmount - appAmount;

              const description =
                transaction.description ||
                transaction.narration ||
                transaction.merchant ||
                "Transaction";

              const id = transaction.id ?? transaction._id ?? index;

              return (
                <article key={id} className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.styles}`}>
                      <config.icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-semibold text-slate-800">
                            {description}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(
                              transaction.date ||
                                transaction.transactionDate ||
                                transaction.createdAt
                            )}
                          </p>
                        </div>

                        <StatusBadge config={config} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <AmountCell
                          label="Bank Amount"
                          value={
                            status === "app-only"
                              ? "—"
                              : formatCurrency(bankAmount, currency)
                          }
                        />

                        <AmountCell
                          label="App Amount"
                          value={
                            status === "bank-only"
                              ? "—"
                              : formatCurrency(appAmount, currency)
                          }
                        />

                        <div className="col-span-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                          <span className="text-xs text-slate-500">
                            Difference
                          </span>
                          <span className={`text-sm font-bold ${
                            Math.abs(difference) < 0.01
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}>
                            {formatCurrency(Math.abs(difference), currency)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-slate-400">
                          Ref:{" "}
                          {transaction.referenceNumber ||
                            transaction.reference ||
                            id}
                        </span>

                        <ActionButtons
                          transaction={transaction}
                          status={status}
                          onView={onView}
                          onMarkMatched={onMarkMatched}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <p className="text-xs text-slate-500">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ArrowLeftRight size={14} />
          Bank vs App comparison
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ config }) {
  const Icon = config.icon;

  return (
    <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.styles}`}>
      <Icon size={13} />
      {config.label}
    </span>
  );
}

function AmountCell({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function ActionButtons({
  transaction,
  status,
  onView,
  onMarkMatched,
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {onView && (
        <button
          type="button"
          onClick={() => onView(transaction)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Eye size={14} />
          View
        </button>
      )}

      {onMarkMatched && status !== "matched" && (
        <button
          type="button"
          onClick={() => onMarkMatched(transaction)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          <CheckCircle2 size={14} />
          Mark Matched
        </button>
      )}
    </div>
  );
}