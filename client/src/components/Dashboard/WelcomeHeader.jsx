
import { useState } from "react";
import {
  CalendarDays,
  Plus,
  Download,
  LoaderCircle,
} from "lucide-react";

export default function WelcomeHeader({
  userName = "there",
  onAddTransaction,
  onExport,
  exporting = false,
}) {
  const [showDate, setShowDate] = useState(false);

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const displayName =
    typeof userName === "string" && userName.trim()
      ? userName.trim().split(" ")[0]
      : "there";

  const handleExport = async () => {
    if (!onExport || exporting) return;

    try {
      await onExport();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <section className="mb-7 min-w-0">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        {/* Welcome content */}
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
            <CalendarDays size={14} />
            Financial overview
          </div>

          <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {displayName}!
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Here’s what’s happening with your money.
          </p>

          <button
            type="button"
            onClick={() => setShowDate((current) => !current)}
            aria-expanded={showDate}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-slate-500 transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <CalendarDays size={14} />
            {showDate ? "Hide date" : "View today's date"}
          </button>

          {showDate && (
            <p className="mt-2 text-sm font-semibold text-slate-700">
              {formattedDate}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          {onExport && (
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {exporting ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Download size={17} />
              )}

              {exporting ? "Exporting..." : "Export"}
            </button>
          )}

          <button
            type="button"
            onClick={onAddTransaction}
            disabled={!onAddTransaction}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <Plus size={18} />
            Add transaction
          </button>
        </div>
      </div>
    </section>
  );
}
