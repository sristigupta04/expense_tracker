import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  CalendarDays,
  Eye,
  ChevronDown,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";

const STATUS_STYLES = {
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Failed: "bg-red-50 text-red-700 ring-red-600/20",
  Cancelled: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export default function TransferTable({
  transfers = [],
  accounts = [],
  onView,
  onRefresh,
  loading = false,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getAccountName = (transfer, type) => {
    const id =
      type === "from"
        ? transfer.fromAccountId
        : transfer.toAccountId;

    const savedName =
      type === "from"
        ? transfer.fromAccountName
        : transfer.toAccountName;

    if (savedName) return savedName;

    const account = accounts.find(
      (item) => String(item.id) === String(id)
    );

    return (
      account?.accountName ||
      account?.bankName ||
      (id ? `Account ${id}` : "Unknown account")
    );
  };

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

  const methods = useMemo(() => {
    return [
      ...new Set(
        transfers
          .map((item) => item.transferMethod || item.method)
          .filter(Boolean)
      ),
    ];
  }, [transfers]);

  const filteredTransfers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = transfers.filter((transfer) => {
      const fromName = getAccountName(transfer, "from");
      const toName = getAccountName(transfer, "to");
      const method = transfer.transferMethod || transfer.method || "";
      const status = transfer.status || "Completed";

      const searchableText = [
        transfer.id,
        transfer.referenceNumber,
        transfer.notes,
        fromName,
        toName,
        method,
        status,
        transfer.amount,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const transferDate = transfer.transferDate || transfer.date || "";
      const dateOnly = String(transferDate).slice(0, 10);

      const matchesSearch = !query || searchableText.includes(query);
      const matchesStatus =
        statusFilter === "All" || status === statusFilter;
      const matchesMethod =
        methodFilter === "All" || method === methodFilter;
      const matchesFrom = !dateFrom || dateOnly >= dateFrom;
      const matchesTo = !dateTo || dateOnly <= dateTo;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMethod &&
        matchesFrom &&
        matchesTo
      );
    });

    return result.sort((a, b) => {
      const dateA = new Date(a.transferDate || a.date || 0).getTime();
      const dateB = new Date(b.transferDate || b.date || 0).getTime();

      if (sortOrder === "oldest") return dateA - dateB;
      if (sortOrder === "amountHigh") {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }
      if (sortOrder === "amountLow") {
        return Number(a.amount || 0) - Number(b.amount || 0);
      }

      return dateB - dateA;
    });
  }, [
    transfers,
    accounts,
    search,
    statusFilter,
    methodFilter,
    dateFrom,
    dateTo,
    sortOrder,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransfers.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const completedCount = filteredTransfers.filter(
    (item) => (item.status || "Completed") === "Completed"
  ).length;

  const totalAmount = filteredTransfers
    .filter((item) => (item.status || "Completed") === "Completed")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setMethodFilter("All");
    setDateFrom("");
    setDateTo("");
    setSortOrder("newest");
    setPage(1);
  };

  const updateFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const hasFilters =
    search ||
    statusFilter !== "All" ||
    methodFilter !== "All" ||
    dateFrom ||
    dateTo ||
    sortOrder !== "newest";

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Matching Transfers
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {filteredTransfers.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ArrowLeftRight size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Completed Transfer Amount
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalAmount)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {completedCount} completed transfer
                {completedCount !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Table container */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Transfer History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and review transfers between your accounts.
            </p>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-4 border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  updateFilter(setSearch, event.target.value)
                }
                placeholder="Search account, reference, method..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  updateFilter(setStatusFilter, event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-9 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <ArrowUpDown
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={methodFilter}
                onChange={(event) =>
                  updateFilter(setMethodFilter, event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-9 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All methods</option>
                {methods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                <CalendarDays size={13} className="mr-1 inline" />
                From date
              </label>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) =>
                  updateFilter(setDateFrom, event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                <CalendarDays size={13} className="mr-1 inline" />
                To date
              </label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) =>
                  updateFilter(setDateTo, event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Sort by
              </label>
              <select
                value={sortOrder}
                onChange={(event) =>
                  updateFilter(setSortOrder, event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="amountHigh">Amount: high to low</option>
                <option value="amountLow">Amount: low to high</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                <X size={15} />
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-100 border-t-blue-700" />
            <p className="text-sm text-slate-500">
              Loading transfers...
            </p>
          </div>
        ) : paginatedTransfers.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ArrowLeftRight size={29} />
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              No transfers found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              {transfers.length === 0
                ? "Your transfer history will appear here once you record a transfer."
                : "Try changing your search or filters to see matching transfers."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-white text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4 font-semibold">Transfer</th>
                    <th className="px-6 py-4 font-semibold">From account</th>
                    <th className="px-6 py-4 font-semibold">To account</th>
                    <th className="px-6 py-4 font-semibold">Method</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedTransfers.map((transfer, index) => {
                    const status = transfer.status || "Completed";
                    const method =
                      transfer.transferMethod || transfer.method || "—";
                    const date =
                      transfer.transferDate || transfer.date;

                    return (
                      <tr
                        key={transfer.id ?? `${date}-${index}`}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                              <ArrowLeftRight size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Transfer
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {transfer.referenceNumber ||
                                  `TRF-${String(transfer.id ?? index + 1).padStart(4, "0")}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <ArrowUpRight
                              size={17}
                              className="shrink-0 text-rose-500"
                            />
                            <span className="max-w-[160px] truncate text-sm font-medium text-slate-700">
                              {getAccountName(transfer, "from")}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <ArrowDownLeft
                              size={17}
                              className="shrink-0 text-emerald-600"
                            />
                            <span className="max-w-[160px] truncate text-sm font-medium text-slate-700">
                              {getAccountName(transfer, "to")}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                            {method}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {formatDate(date)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-900">
                          {formatCurrency(
                            transfer.amount,
                            transfer.currency || "INR"
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={status} />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => onView?.(transfer)}
                            disabled={!onView}
                            title="View transfer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-default disabled:opacity-50"
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile and tablet cards */}
            <div className="grid grid-cols-1 gap-3 p-4 sm:p-5 lg:hidden">
              {paginatedTransfers.map((transfer, index) => {
                const status = transfer.status || "Completed";
                const date =
                  transfer.transferDate || transfer.date;
                const method =
                  transfer.transferMethod || transfer.method || "—";

                return (
                  <article
                    key={transfer.id ?? `${date}-${index}`}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <ArrowLeftRight size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {transfer.referenceNumber ||
                              `TRF-${String(transfer.id ?? index + 1).padStart(4, "0")}`}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(date)} · {method}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={status} />
                    </div>

                    <div className="my-4 space-y-3 rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-xs text-slate-500">
                          <ArrowUpRight size={15} className="text-rose-500" />
                          From
                        </span>
                        <span className="max-w-[65%] truncate text-right text-sm font-medium text-slate-800">
                          {getAccountName(transfer, "from")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-xs text-slate-500">
                          <ArrowDownLeft
                            size={15}
                            className="text-emerald-600"
                          />
                          To
                        </span>
                        <span className="max-w-[65%] truncate text-right text-sm font-medium text-slate-800">
                          {getAccountName(transfer, "to")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Transfer amount
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {formatCurrency(
                            transfer.amount,
                            transfer.currency || "INR"
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onView?.(transfer)}
                        disabled={!onView}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                      >
                        <Eye size={15} />
                        View details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>Rows per page</span>

                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>

                <span>
                  Showing{" "}
                  {filteredTransfers.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                  {"–"}
                  {Math.min(currentPage * pageSize, filteredTransfers.length)}
                  {" "}of {filteredTransfers.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="min-w-16 text-center text-sm font-semibold text-slate-700">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const style =
    STATUS_STYLES[status] ||
    "bg-slate-100 text-slate-600 ring-slate-500/20";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}