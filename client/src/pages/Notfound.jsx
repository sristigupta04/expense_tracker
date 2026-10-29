
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  SearchX,
  Wallet,
} from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />

      <section className="relative w-full max-w-xl text-center">
        {/* Brand */}
        <Link
          to="/"
          className="mb-12 inline-flex items-center gap-3"
          aria-label="Expense Tracker home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Wallet size={23} />
          </span>

          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Expense<span className="text-blue-600">Tracker</span>
          </span>
        </Link>

        {/* 404 illustration */}
        <div className="relative mx-auto mb-7 flex h-36 w-36 items-center justify-center rounded-[2rem] border border-blue-100 bg-white shadow-xl shadow-blue-900/5">
          <div className="absolute inset-3 rounded-[1.5rem] bg-blue-50" />

          <SearchX
            size={58}
            strokeWidth={1.5}
            className="relative text-blue-600"
          />

          <span className="absolute -right-4 -top-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">
            404
          </span>
        </div>

        {/* Message */}
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
          Page not found
        </p>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Lost your way?
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back to managing your finances.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
          >
            <ArrowLeft size={17} />
            Go back
          </button>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Home size={17} />
            Back to Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-400">
            ExpenseTracker · Track smarter. Spend better.
          </p>
        </div>
      </section>
    </main>
  );
}
