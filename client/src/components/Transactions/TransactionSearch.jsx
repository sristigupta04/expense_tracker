
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

export default function TransactionSearch({
  value,
  onChange,
  placeholder = "Search transactions...",
  resultCount,
  showResultCount = false,
}) {
  const [query, setQuery] = useState(value ?? "");

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (value ?? "")) {
        onChange?.(query);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, value, onChange]);

  const handleClear = () => {
    setQuery("");
    onChange?.("");
  };

  return (
    <div className="w-full">
      <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
        <Search size={18} className="shrink-0 text-slate-400" />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label="Search transactions"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showResultCount && Number.isFinite(resultCount) && (
        <p className="mt-2 text-xs text-slate-500" aria-live="polite">
          {resultCount} {resultCount === 1 ? "result" : "results"} found
        </p>
      )}
    </div>
  );
}
