
import { useState } from "react";
import { CalendarDays, Plus, Download } from "lucide-react";

export default function WelcomeHeader({
  userName = "there",
  onAddTransaction,
  onExport,
}) {
  const [showDate, setShowDate] = useState(false);

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="mb-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <CalendarDays size={14} />
            Financial overview
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {userName}!
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Here’s what’s happening with your money.
          </p>

          <button
            type="button"
            onClick={() => setShowDate((current) => !current)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-blue-600"
          >
            <CalendarDays size={14} />
            {showDate ? "Hide date" : "View today's date"}
          </button>

          {showDate && (
            <p className="mt-1 text-sm font-medium text-slate-700">
              {formattedDate}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
            >
              <Download size={17} />
              Export
            </button>
          )}

          <button
            type="button"
            onClick={onAddTransaction}
            disabled={!onAddTransaction}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Add transaction
          </button>
        </div>
      </div>
    </section>
  );
}
