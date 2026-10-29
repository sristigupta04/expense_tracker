import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  CalendarDays,
  ArrowDownUp,
  X,
  RotateCcw,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function BankTransactionFilters({
  accounts = [],
  filters = {},
  onFilterChange,
  onReset,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const defaultFilters = {
    search: "",
    type: "all",
    accountId: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    sortBy: "newest",
  };

  const currentFilters = { ...defaultFilters, ...filters };

  const updateFilter = (name, value) => {
    onFilterChange?.({
      ...currentFilters,
      [name]: value,
    });
  };

  const resetFilters = () => {
    onFilterChange?.(defaultFilters);
    onReset?.();
  };

  const activeFilterCount = [
    currentFilters.type !== "all",
    currentFilters.accountId !== "all",
    Boolean(currentFilters.startDate),
    Boolean(currentFilters.endDate),
    Boolean(currentFilters.minAmount),
    Boolean(currentFilters.maxAmount),
  ].filter(Boolean).length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <SlidersHorizontal size={19} />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              Filter Transactions
            </h3>
            <p className="text-xs text-slate-500">
              Find and organize your bank transactions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((previous) => !previous)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <SlidersHorizontal size={15} />
          {showAdvanced ? "Less Filters" : "More Filters"}

          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs text-blue-700">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={currentFilters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search by description, reference or merchant..."
          className={`${inputClass} pl-10 pr-10`}
          aria-label="Search bank transactions"
        />

        {currentFilters.search && (
          <button
            type="button"
            onClick={() => updateFilter("search", "")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Main filters */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label
            htmlFor="bank-transaction-type"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Transaction Type
          </label>

          <select
            id="bank-transaction-type"
            value={currentFilters.type}
            onChange={(event) => updateFilter("type", event.target.value)}
            className={inputClass}
          >
            <option value="all">All Transactions</option>
            <option value="income">Income / Credit</option>
            <option value="expense">Expense / Debit</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="bank-transaction-account"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Bank Account
          </label>

          <select
            id="bank-transaction-account"
            value={currentFilters.accountId}
            onChange={(event) => updateFilter("accountId", event.target.value)}
            className={inputClass}
          >
            <option value="all">All Accounts</option>

            {accounts.map((account) => (
              <option key={account.id} value={String(account.id)}>
                {account.accountName || account.bankName || "Bank Account"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="bank-transaction-sort"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Sort By
          </label>

          <div className="relative">
            <ArrowDownUp
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="bank-transaction-sort"
              value={currentFilters.sortBy}
              onChange={(event) => updateFilter("sortBy", event.target.value)}
              className={`${inputClass} pl-10`}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amountHigh">Amount: High to Low</option>
              <option value="amountLow">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
            <CalendarDays size={17} className="text-blue-700" />
            Advanced Filters
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="bank-transaction-start"
                className="mb-1.5 block text-xs font-semibold text-slate-500"
              >
                From Date
              </label>

              <input
                id="bank-transaction-start"
                type="date"
                value={currentFilters.startDate}
                max={currentFilters.endDate || undefined}
                onChange={(event) =>
                  updateFilter("startDate", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="bank-transaction-end"
                className="mb-1.5 block text-xs font-semibold text-slate-500"
              >
                To Date
              </label>

              <input
                id="bank-transaction-end"
                type="date"
                value={currentFilters.endDate}
                min={currentFilters.startDate || undefined}
                onChange={(event) =>
                  updateFilter("endDate", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="bank-transaction-min"
                className="mb-1.5 block text-xs font-semibold text-slate-500"
              >
                Minimum Amount
              </label>

              <input
                id="bank-transaction-min"
                type="number"
                min="0"
                step="0.01"
                placeholder="₹ 0.00"
                value={currentFilters.minAmount}
                onChange={(event) =>
                  updateFilter("minAmount", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="bank-transaction-max"
                className="mb-1.5 block text-xs font-semibold text-slate-500"
              >
                Maximum Amount
              </label>

              <input
                id="bank-transaction-max"
                type="number"
                min="0"
                step="0.01"
                placeholder="₹ 10,000"
                value={currentFilters.maxAmount}
                onChange={(event) =>
                  updateFilter("maxAmount", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          Filters update when you change a field.
        </p>

        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <RotateCcw size={15} />
          Clear Filters
        </button>
      </div>
    </section>
  );
}