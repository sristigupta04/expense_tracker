
import { useMemo, useState } from "react";
import {
  FileSpreadsheet,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ReceiptText,
  Wallet,
  X,
} from "lucide-react";

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatCurrency = (amount, currency = "INR") => {
  const value = toNumber(amount);

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₹${value.toLocaleString("en-IN")}`;
  }
};

const formatDate = (date) => {
  if (!date) return "—";

  const value = String(date);
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTransactionType = (transaction = {}) => {
  const rawType = String(
    transaction.type ||
      transaction.transactionType ||
      transaction.direction ||
      ""
  )
    .trim()
    .toLowerCase();

  if (["credit", "income", "deposit", "cr"].includes(rawType)) {
    return "credit";
  }

  if (
    ["debit", "expense", "withdrawal", "payment", "dr"].includes(rawType)
  ) {
    return "debit";
  }

  if (
    toNumber(transaction.credit ?? transaction.creditAmount) > 0
  ) {
    return "credit";
  }

  if (
    toNumber(transaction.debit ?? transaction.debitAmount) > 0
  ) {
    return "debit";
  }

  return "unknown";
};

const getAmount = (transaction, type) => {
  if (type === "credit") {
    return Math.abs(
      toNumber(
        transaction.credit ??
          transaction.creditAmount ??
          transaction.amount
      )
    );
  }

  if (type === "debit") {
    return Math.abs(
      toNumber(
        transaction.debit ??
          transaction.debitAmount ??
          transaction.amount
      )
    );
  }

  return Math.abs(toNumber(transaction.amount));
};

const getDescription = (transaction) =>
  transaction.description ||
  transaction.narration ||
  transaction.particulars ||
  transaction.merchant ||
  "Bank transaction";

const getReference = (transaction) =>
  transaction.referenceNumber ||
  transaction.reference ||
  transaction.refNo ||
  "—";

const getTransactionDate = (transaction) =>
  transaction.date ||
  transaction.transactionDate ||
  transaction.valueDate ||
  transaction.createdAt;

export default function StatementPreview({
  transactions = [],
  fileName = "Bank Statement",
  bankName = "",
  accountNumber = "",
  currency = "INR",
  loading = false,
  onClose,
  onConfirm,
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const validTransactions = Array.isArray(transactions)
    ? transactions.filter(
        (transaction) =>
          transaction && typeof transaction === "object"
      )
    : [];

  const summary = useMemo(() => {
    let credits = 0;
    let debits = 0;
    let creditCount = 0;
    let debitCount = 0;

    validTransactions.forEach((transaction) => {
      const type = getTransactionType(transaction);
      const amount = getAmount(transaction, type);

      if (type === "credit") {
        credits += amount;
        creditCount += 1;
      } else if (type === "debit") {
        debits += amount;
        debitCount += 1;
      }
    });

    return {
      credits,
      debits,
      creditCount,
      debitCount,
      total: validTransactions.length,
    };
  }, [validTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return validTransactions.filter((transaction) => {
      const description = getDescription(transaction).toLowerCase();
      const reference = getReference(transaction).toLowerCase();
      const type = getTransactionType(transaction);

      const matchesSearch =
        !query ||
        description.includes(query) ||
        reference.includes(query);

      const matchesType =
        typeFilter === "all" || type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [validTransactions, search, typeFilter]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-48 rounded bg-slate-100" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 rounded-xl bg-slate-100"
              />
            ))}
          </div>

          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-12 rounded bg-slate-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <FileSpreadsheet size={24} />
          </div>

          <div className="min-w-0">
            <h2 className="break-words text-lg font-bold text-slate-900">
              Statement Preview
            </h2>

            <p className="mt-1 break-all text-sm text-slate-500">
              {fileName}
            </p>

            {(bankName || accountNumber) && (
              <p className="mt-1 text-xs text-slate-400">
                {[
                  bankName,
                  accountNumber
                    ? `•••• ${String(accountNumber).slice(-4)}`
                    : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close statement preview"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-slate-50/60 p-5 sm:grid-cols-3 sm:p-6">
        <SummaryCard
          title="Total Transactions"
          value={summary.total}
          subtitle="Imported rows"
          icon={ReceiptText}
          iconStyles="bg-blue-50 text-blue-700"
        />

        <SummaryCard
          title="Total Credits"
          value={formatCurrency(summary.credits, currency)}
          subtitle={`${summary.creditCount} credit transactions`}
          icon={ArrowDownLeft}
          iconStyles="bg-emerald-50 text-emerald-700"
          valueStyles="text-emerald-700"
        />

        <SummaryCard
          title="Total Debits"
          value={formatCurrency(summary.debits, currency)}
          subtitle={`${summary.debitCount} debit transactions`}
          icon={ArrowUpRight}
          iconStyles="bg-rose-50 text-rose-700"
          valueStyles="text-rose-700"
        />
      </div>

      {/* Search and filters */}
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_210px]">
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
              aria-label="Search statement transactions"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filter statement transactions by type"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="all">All transaction types</option>
            <option value="credit">Credits only</option>
            <option value="debit">Debits only</option>
            <option value="unknown">Unknown type</option>
          </select>
        </div>
      </div>

      {/* Transactions */}
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <FileSpreadsheet size={26} />
          </div>

          <h3 className="mt-4 font-bold text-slate-900">
            No transactions found
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {validTransactions.length === 0
              ? "Upload a statement containing transaction rows to preview it here."
              : "Try changing your search or transaction type filter."}
          </p>

          {(search || typeFilter !== "all") && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Transaction
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reference
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((transaction, index) => {
                  const type = getTransactionType(transaction);
                  const amount = getAmount(transaction, type);

                  return (
                    <tr
                      key={
                        transaction.id ??
                        transaction._id ??
                        `transaction-${index}`
                      }
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <TransactionIcon type={type} />

                          <p className="max-w-[260px] truncate text-sm font-semibold text-slate-800">
                            {getDescription(transaction)}
                          </p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(getTransactionDate(transaction))}
                      </td>

                      <td className="px-5 py-4">
                        <TypeBadge type={type} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <AmountDisplay
                          amount={amount}
                          type={type}
                          currency={currency}
                        />
                      </td>

                      <td className="break-all px-5 py-4 text-sm text-slate-500">
                        {getReference(transaction)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filteredTransactions.map((transaction, index) => {
              const type = getTransactionType(transaction);
              const amount = getAmount(transaction, type);

              return (
                <div
                  key={
                    transaction.id ??
                    transaction._id ??
                    `transaction-${index}`
                  }
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <TransactionIcon type={type} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="break-words text-sm font-semibold text-slate-800">
                          {getDescription(transaction)}
                        </p>

                        <AmountDisplay
                          amount={amount}
                          type={type}
                          currency={currency}
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <TypeBadge type={type} />

                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <CalendarDays size={12} />
                          {formatDate(getTransactionDate(transaction))}
                        </span>
                      </div>

                      <p className="mt-2 break-all text-xs text-slate-400">
                        Ref: {getReference(transaction)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Footer and actions */}
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Showing {filteredTransactions.length} of {summary.total} transactions
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Review the preview before importing statement transactions.
          </p>
        </div>

        {onConfirm && (
          <button
            type="button"
            onClick={() => onConfirm(filteredTransactions)}
            disabled={filteredTransactions.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={17} />
            Confirm Import
          </button>
        )}
      </div>
    </section>
  );
}

function TransactionIcon({ type }) {
  const styles =
    type === "credit"
      ? "bg-emerald-50 text-emerald-700"
      : type === "debit"
        ? "bg-rose-50 text-rose-700"
        : "bg-slate-100 text-slate-500";

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles}`}
    >
      {type === "credit" ? (
        <ArrowDownLeft size={19} />
      ) : type === "debit" ? (
        <ArrowUpRight size={19} />
      ) : (
        <Wallet size={19} />
      )}
    </div>
  );
}

function AmountDisplay({ amount, type, currency }) {
  const styles =
    type === "credit"
      ? "text-emerald-700"
      : type === "debit"
        ? "text-rose-700"
        : "text-slate-700";

  return (
    <span className={`shrink-0 text-sm font-bold ${styles}`}>
      {type === "credit" ? "+" : type === "debit" ? "−" : ""}
      {formatCurrency(amount, currency)}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconStyles,
  valueStyles = "text-slate-900",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className={`mt-2 break-words text-xl font-bold ${valueStyles}`}>
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyles}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }) {
  const config = {
    credit: {
      label: "Credit",
      styles: "bg-emerald-50 text-emerald-700",
    },
    debit: {
      label: "Debit",
      styles: "bg-rose-50 text-rose-700",
    },
    unknown: {
      label: "Unknown",
      styles: "bg-slate-100 text-slate-600",
    },
  };

  const item = config[type] || config.unknown;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${item.styles}`}
    >
      {item.label}
    </span>
  );
}
