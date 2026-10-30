
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

export default function TransactionSearch({
  value = "",
  onChange,
  placeholder = "Search transactions...",
  resultCount,
  showResultCount = false,
  debounceDelay = 250,
  disabled = false,
}) {
  const [query, setQuery] = useState(value ?? "");

  // Sync with parent value
  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (value ?? "")) {
        onChange?.(query);
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [query, value, onChange, debounceDelay]);

  const handleClear = () => {
    setQuery("");
    onChange?.("");
  };

  const hasQuery = query.length > 0;
  const validResultCount =
    typeof resultCount === "number" && Number.isFinite(resultCount);

  return (
    <div className="w-full">
      <div
        className={`flex h-11 items-center gap-2.5 rounded-xl border px-3.5 transition-all ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
            : "border-slate-200 bg-white hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50"
        }`}
      >
        <Search
          size={18}
          className="shrink-0 text-slate-400"
          aria-hidden="true"
        />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label="Search transactions"
          aria-describedby={
            showResultCount && validResultCount
              ? "transaction-search-count"
              : undefined
          }
          disabled={disabled}
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        />

        {hasQuery && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showResultCount && validResultCount && (
        <p
          id="transaction-search-count"
          className="mt-2 text-xs text-slate-500"
          aria-live="polite"
        >
          {resultCount} {resultCount === 1 ? "result" : "results"} found
        </p>
      )}
    </div>
  );
}
