
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/Authcontext";
import {
  ArrowLeft,
  UserRound,
  ShieldCheck,
  Power,
  Trash2,
  LogOut,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

export default function AccountManagement() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const name = user?.name || user?.username || "Your account";
  const email = user?.email || "Email not available";

  const options = [
    {
      title: "Personal information",
      description: "Update your name and profile details.",
      icon: UserRound,
      action: () => navigate("/settings/profile"),
      color: "blue",
    },
    {
      title: "Privacy & security",
      description: "Manage password and security preferences.",
      icon: ShieldCheck,
      action: () => navigate("/settings/privacy"),
      color: "indigo",
    },
    {
      title: "Deactivate account",
      description: "Temporarily disable your account access.",
      icon: Power,
      action: () => navigate("/settings/account/deactivate"),
      color: "amber",
    },
    {
      title: "Delete account",
      description: "Open the permanent account deletion page.",
      icon: Trash2,
      action: () => navigate("/settings/account/delete"),
      color: "red",
    },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setError("Unable to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
      setShowLogout(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Settings
        </button>

        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-800">
            Account
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Account Management
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Manage your personal information, security and account access.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {/* Account overview */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-[#03045E] via-[#0D21A1] to-[#2563EB]" />

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-900">
              {name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={13} />
                  Signed in
                </span>
              </div>
              <p className="mt-1 break-all text-sm text-slate-500">
                {email}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Expense Tracker account
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/settings/profile")}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
            >
              Edit profile
            </button>
          </div>
        </section>

        {/* Account options */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="font-bold">Manage your account</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose an option to continue.
            </p>
          </div>

          {options.map((option) => {
            const Icon = option.icon;

            const iconStyles = {
              blue: "bg-blue-50 text-blue-800",
              indigo: "bg-indigo-50 text-indigo-800",
              amber: "bg-amber-50 text-amber-700",
              red: "bg-red-50 text-red-700",
            };

            return (
              <button
                key={option.title}
                type="button"
                onClick={option.action}
                className="flex w-full items-center gap-4 border-b border-slate-100 px-5 py-5 text-left transition last:border-0 hover:bg-slate-50 sm:px-6"
              >
                <div className={`rounded-xl p-3 ${iconStyles[option.color]}`}>
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`font-semibold ${
                      option.color === "red"
                        ? "text-red-700"
                        : "text-slate-800"
                    }`}
                  >
                    {option.title}
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {option.description}
                  </p>
                </div>

                <ChevronRight size={19} className="shrink-0 text-slate-400" />
              </button>
            );
          })}
        </section>

        {/* Sign out */}
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <LogOut size={21} />
            </div>
            <div>
              <h2 className="font-bold">Sign out</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                End your current session on this device.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogout(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </section>
      </div>

      {/* Confirmation dialog */}
      {showLogout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => !loggingOut && setShowLogout(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-heading"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <LogOut size={23} />
              </div>
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setShowLogout(false)}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <h2 id="logout-heading" className="text-xl font-bold">
              Sign out of your account?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              You can sign in again whenever you want to access your expenses
              and budgets.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setShowLogout(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="rounded-xl bg-[#0D21A1] px-4 py-3 text-sm font-semibold text-white hover:bg-[#03045E] disabled:opacity-50"
              >
                {loggingOut ? "Signing out..." : "Yes, sign out"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
