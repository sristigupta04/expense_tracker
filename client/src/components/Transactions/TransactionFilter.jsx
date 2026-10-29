
import { RotateCcw, SlidersHorizontal } from "lucide-react";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

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
}) {
  const hasFilters =
    type !== "all" ||
    category !== "all" ||
    startDate !== "" ||
    endDate !== "";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <SlidersHorizontal size={18} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Filters
            </h3>
            <p className="text-xs text-slate-500">
              Narrow down your transactions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasFilters}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
        >
          <RotateCcw size={14} />
          Reset filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label
            htmlFor="transaction-type-filter"
            className="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            Transaction type
          </label>

          <select
            id="transaction-type-filter"
            value={type}
            onChange={(event) => onTypeChange?.(event.target.value)}
            className={selectClass}
          >
            <option value="all">All transactions</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="transaction-category-filter"
            className="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            Category
          </label>

          <select
            id="transaction-category-filter"
            value={category}
            onChange={(event) =>
              onCategoryChange?.(event.target.value)
            }
            className={selectClass}
          >
            <option value="all">All categories</option>

            {categories.map((item) => {
              const value =
                typeof item === "string" ? item : item.name;

              if (!value) return null;

              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label
            htmlFor="transaction-start-date"
            className="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            From date
          </label>

          <input
            id="transaction-start-date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) =>
              onStartDateChange?.(event.target.value)
            }
            className={selectClass}
          />
        </div>

        <div>
          <label
            htmlFor="transaction-end-date"
            className="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            To date
          </label>

          <input
            id="transaction-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) =>
              onEndDateChange?.(event.target.value)
            }
            className={selectClass}
          />
        </div>
      </div>
    </section>
  );
}
