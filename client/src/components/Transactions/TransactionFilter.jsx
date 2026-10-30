
import { useMemo } from "react";
import {
  RotateCcw,
  SlidersHorizontal,
  CalendarDays,
  Filter,
} from "lucide-react";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50";

const normalizeCategory = (item) => {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") return item.name || "";
  return "";
};

export default function TransactionFilter({
  type = "all",
  category = "all",
  startDate = "",
  endDate = "",
  categories = [],
  onTypeChange,
  onCategoryChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
  disabled = false,
}) {
  const categoryOptions = useMemo(
    () =>
      [...new Set(categories.map(normalizeCategory).filter(Boolean))],
    [categories]
  );

  const activeFilterCount = [
    type !== "all",
    category !== "all",
    Boolean(startDate),
    Boolean(endDate),
  ].filter(Boolean).length;

  const hasFilters = activeFilterCount > 0;

  const handleStartDateChange = (value) => {
    onStartDateChange?.(value);

    if (endDate && value && value > endDate) {
      onEndDateChange?.("");
    }
  };

  const handleEndDateChange = (value) => {
    onEndDateChange?.(value);

    if (startDate && value && value < startDate) {
      onStartDateChange?.("");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <SlidersHorizontal size={19} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Transaction Filters
              </h3>

              {hasFilters && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {activeFilterCount} active
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              Narrow down your transactions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasFilters || disabled}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
        >
          <RotateCcw size={14} />
          Reset filters
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Type */}
        <div>
          <label
            htmlFor="transaction-type-filter"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
          >
            <Filter size={13} className="text-slate-400" />
            Transaction type
          </label>

          <select
            id="transaction-type-filter"
            value={type}
            disabled={disabled}
            onChange={(event) => onTypeChange?.(event.target.value)}
            className={selectClass}
          >
            <option value="all">All transactions</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="transaction-category-filter"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
          >
            <SlidersHorizontal size={13} className="text-slate-400" />
            Category
          </label>

          <select
            id="transaction-category-filter"
            value={category}
            disabled={disabled}
            onChange={(event) => onCategoryChange?.(event.target.value)}
            className={selectClass}
          >
            <option value="all">All categories</option>

            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Start date */}
        <div>
          <label
            htmlFor="transaction-start-date"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
          >
            <CalendarDays size={13} className="text-slate-400" />
            From date
          </label>

          <input
            id="transaction-start-date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            disabled={disabled}
            onChange={(event) => handleStartDateChange(event.target.value)}
            className={selectClass}
          />
        </div>

        {/* End date */}
        <div>
          <label
            htmlFor="transaction-end-date"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
          >
            <CalendarDays size={13} className="text-slate-400" />
            To date
          </label>

          <input
            id="transaction-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            disabled={disabled}
            onChange={(event) => handleEndDateChange(event.target.value)}
            className={selectClass}
          />
        </div>
      </div>

      {/* Active filters summary */}
      {hasFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="text-xs font-medium text-slate-500">
            Active:
          </span>

          {type !== "all" && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {type === "income" ? "Income" : "Expense"}
            </span>
          )}

          {category !== "all" && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {category}
            </span>
          )}

          {startDate && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              From: {startDate}
            </span>
          )}

          {endDate && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              To: {endDate}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
