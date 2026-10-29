import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Eye,
  ReceiptText,
  ArrowUpDown,
} from "lucide-react";
import { Link } from "react-router-dom";

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

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTransactionType = (transaction) => {
  const type = String(
    transaction.type || transaction.transactionType || ""
  ).toLowerCase();

  if (["income", "credit", "deposit"].includes(type)) return "credit";
  if (["expense", "debit", "withdrawal", "payment"].includes(type))
    return "debit";
  if (["transfer", "fund_transfer"].includes(type)) return "transfer";

  // Fallback for imported bank statements.
  const direction = String(transaction.direction || "").toLowerCase();
  if (["credit", "income", "deposit"].includes(direction)) return "credit";
  if (["debit", "expense", "withdrawal"].includes(direction)) return "debit";

  return "debit";
};

const typeConfig = {
  credit: {
    label: "Credit",
    icon: ArrowDownLeft,
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amount: "text-emerald-700",
  },
  debit: {
    label: "Debit",
    icon: ArrowUpRight,
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    amount: "text-rose-700",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowLeftRight,
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    amount: "text-blue-700",
  },
};

const statusConfig = {
  completed: "bg-emerald-50 text-emerald-700",
  success: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-rose-50 text-rose-700",
  cancelled: "bg-slate-100 text-slate-600",
  reconciled: "bg-blue-50 text-blue-700",
};

export default function BankTransactionTable({
  transactions = [],
  onView,
  onSort,
  sortBy = "newest",
  loading = false,
}) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="space-y-4 p-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex animate-pulse items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
              <div className="h-4 w-20 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Table heading */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Bank Transactions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {transactions.length}{" "}
            {transactions.length === 1 ? "transaction" : "transactions"} found
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
          <ReceiptText size={15} />
          Transaction History
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <ReceiptText size={26} />
          </div>
          <h3 className="mt-4 font-bold text-slate-900">
            No transactions found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try changing your filters or import a bank statement to see
            transactions here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Transaction
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Account
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
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction, index) => {
                  const type = getTransactionType(transaction);
                  const config = typeConfig[type];
                  const TypeIcon = config.icon;

                  const status = String(
                    transaction.status || "Completed"
                  ).toLowerCase();

                  const statusClass =
                    statusConfig[status] || "bg-slate-100 text-slate-600";

                  const accountName =
                    transaction.accountName ||
                    transaction.bankName ||
                    transaction.account?.accountName ||
                    "Bank Account";

                  const description =
                    transaction.description ||
                    transaction.merchant ||
                    transaction.narration ||
                    "Bank transaction";

                  const amount = Math.abs(
                    Number(transaction.amount || 0)
                  );

                  const currency = transaction.currency || "INR";

                  return (
                    <tr
                      key={transaction.id ?? transaction._id ?? index}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.badge}`}
                          >
                            <TypeIcon size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-sm font-semibold text-slate-800">
                              {description}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Ref:{" "}
                              {transaction.referenceNumber ||
                                transaction.reference ||
                                transaction.id ||
                                transaction._id ||
                                "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[170px] truncate text-sm font-medium text-slate-700">
                          {accountName}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          transaction.date ||
                            transaction.transactionDate ||
                            transaction.createdAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.badge}`}
                        >
                          {config.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <span className={`text-sm font-bold ${config.amount}`}>
                          {type === "credit" ? "+" : type === "debit" ? "−" : ""}
                          {formatCurrency(amount, currency)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <TransactionAction
                          transaction={transaction}
                          onView={onView}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile responsive cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {transactions.map((transaction, index) => {
              const type = getTransactionType(transaction);
              const config = typeConfig[type];
              const TypeIcon = config.icon;

              const description =
                transaction.description ||
                transaction.merchant ||
                transaction.narration ||
                "Bank transaction";

              const status = String(
                transaction.status || "Completed"
              ).toLowerCase();

              const statusClass =
                statusConfig[status] || "bg-slate-100 text-slate-600";

              const amount = Math.abs(Number(transaction.amount || 0));

              return (
                <div
                  key={transaction.id ?? transaction._id ?? index}
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.badge}`}
                    >
                      <TypeIcon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="break-words text-sm font-semibold text-slate-800">
                          {description}
                        </p>

                        <p
                          className={`shrink-0 text-sm font-bold ${config.amount}`}
                        >
                          {type === "credit" ? "+" : type === "debit" ? "−" : ""}
                          {formatCurrency(amount, transaction.currency || "INR")}
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {transaction.accountName ||
                          transaction.bankName ||
                          transaction.account?.accountName ||
                          "Bank Account"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.badge}`}
                        >
                          {config.label}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass}`}
                        >
                          {status}
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDate(
                            transaction.date ||
                              transaction.transactionDate ||
                              transaction.createdAt
                          )}
                        </span>

                        <TransactionAction
                          transaction={transaction}
                          onView={onView}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Footer */}
      {transactions.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing {transactions.length} transactions
          </p>

          {onSort && (
            <button
              type="button"
              onClick={() => onSort(sortBy === "newest" ? "oldest" : "newest")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              <ArrowUpDown size={14} />
              Toggle date order
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function TransactionAction({ transaction, onView }) {
  if (onView) {
    return (
      <button
        type="button"
        onClick={() => onView(transaction)}
        aria-label="View transaction details"
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
      >
        <Eye size={15} />
        View
      </button>
    );
  }

  const id = transaction.id ?? transaction._id;

  if (id == null) return null;

  return (
    <Link
      to={`/bank-transactions/${id}`}
      aria-label="View transaction details"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
    >
      <Eye size={15} />
      View
    </Link>
  );
}