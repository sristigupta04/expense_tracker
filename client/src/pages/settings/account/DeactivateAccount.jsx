
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Power,
  AlertTriangle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerSettings";

export default function DeactivateAccount() {
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const reasons = [
    "I am taking a break",
    "I no longer need this app",
    "I have privacy concerns",
    "I am experiencing technical issues",
    "Other",
  ];

  function requestDeactivation(event) {
    event.preventDefault();
    setStatus(null);

    if (!reason) {
      setStatus({
        type: "error",
        text: "Please select a reason before continuing.",
      });
      return;
    }

    if (!confirmed) {
      setStatus({
        type: "error",
        text: "Please confirm that you understand the consequences.",
      });
      return;
    }

    setShowConfirm(true);
  }

  async function confirmDeactivation() {
    setBusy(true);
    setStatus(null);

    try {
      /*
       * TODO: Connect your backend deactivation endpoint here.
       * Do not mark the account as deactivated until the server confirms it.
       */

      const existing = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...existing,
          deactivationRequest: {
            reason,
            details: details.trim(),
            requestedAt: new Date().toISOString(),
            status: "pending",
          },
        })
      );

      setShowConfirm(false);
      setStatus({
        type: "success",
        text: "Your deactivation request has been saved in this browser only. Your account has NOT been deactivated.",
      });
    } catch {
      setStatus({
        type: "error",
        text: "Unable to save the request. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/settings/account")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Account Management
        </button>

        <header className="mb-7">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-800">
            <Power size={15} />
            Account controls
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Deactivate account
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Take a break from your Expense Tracker account. Review the
            information below before continuing.
          </p>
        </header>

        {status && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={19} className="mt-0.5 shrink-0" />
            )}
            {status.text}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={23}
              className="mt-0.5 shrink-0 text-amber-700"
            />
            <div>
              <h2 className="font-bold text-amber-950">
                What you should know
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
                <li>• You may lose access to your account while it is deactivated.</li>
                <li>• Your financial records may be retained according to the application's data policy.</li>
                <li>• Reactivation must be supported by the application before it can be guaranteed.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold">Before you continue</h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-800">
                <ShieldCheck size={21} />
              </div>
              <div>
                <h3 className="font-semibold">Your data</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Deactivation should not automatically delete your transactions,
                  budgets or reports. The backend must define how your data is handled.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-800">
                <Clock size={21} />
              </div>
              <div>
                <h3 className="font-semibold">Temporary action</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Deactivation is different from permanent account deletion.
                </p>
              </div>
            </div>
          </div>
        </section>

        <form
          onSubmit={requestDeactivation}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <h2 className="text-lg font-bold">Why are you deactivating?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your feedback can help improve the application.
          </p>

          <div className="mt-5 space-y-3">
            {reasons.map((item) => (
              <label
                key={item}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                  reason === item
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="deactivationReason"
                  value={item}
                  checked={reason === item}
                  onChange={(event) => setReason(event.target.value)}
                  className="h-4 w-4 accent-blue-800"
                />
                <span className="text-sm font-medium text-slate-700">
                  {item}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5">
            <label
              htmlFor="deactivation-details"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Additional feedback (optional)
            </label>
            <textarea
              id="deactivation-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Tell us more..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {details.length}/1000
            </p>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 accent-blue-800"
            />
            <span className="text-sm leading-6 text-slate-600">
              I understand that deactivation may restrict access to my account
              and that this form alone does not guarantee account deactivation.
            </span>
          </label>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => navigate("/settings/account")}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-100"
            >
              <Power size={17} />
              Continue
            </button>
          </div>
        </form>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => !busy && setShowConfirm(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <Power size={23} />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowConfirm(false)}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <h2
              id="deactivate-confirm-title"
              className="text-xl font-bold"
            >
              Confirm deactivation request
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Continue only if you understand the impact. In this demo,
              confirming saves a local request; it does not deactivate your
              account on the server.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Go back
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={confirmDeactivation}
                className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {busy ? "Saving..." : "Confirm request"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
