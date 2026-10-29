
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  X,
  LockKeyhole,
} from "lucide-react";

export default function DeleteAccount() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const reasons = [
    "I no longer need this app",
    "I am switching to another service",
    "I have privacy concerns",
    "I am experiencing technical issues",
    "Other",
  ];

  function handleContinue(event) {
    event.preventDefault();
    setStatus(null);

    if (!email.trim()) {
      setStatus({
        type: "error",
        text: "Enter your account email address.",
      });
      return;
    }

    if (!reason) {
      setStatus({
        type: "error",
        text: "Please select a reason for deleting your account.",
      });
      return;
    }

    if (!acknowledged) {
      setStatus({
        type: "error",
        text: "Please confirm that you understand this action may be permanent.",
      });
      return;
    }

    setShowConfirm(true);
  }

  async function handleDeleteRequest() {
    setBusy(true);
    setStatus(null);

    try {
      /*
       * TODO: Connect an authenticated backend deletion endpoint.
       * Verify the user's identity on the server before deletion.
       * Never delete an account using only a client-side email value.
       */

      setShowConfirm(false);
      setStatus({
        type: "error",
        text: "Account deletion is not connected yet. Your account has NOT been deleted. Connect the backend API before enabling permanent deletion.",
      });
    } catch {
      setStatus({
        type: "error",
        text: "Unable to process the request. Please try again.",
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
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-700">
            <Trash2 size={15} />
            Permanent account action
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Delete account
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Review the consequences carefully before requesting permanent
            deletion of your Expense Tracker account.
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
            <span>{status.text}</span>
          </div>
        )}

        {/* Permanent deletion warning */}
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert
              size={25}
              className="mt-0.5 shrink-0 text-red-700"
            />
            <div>
              <h2 className="font-bold text-red-950">
                This action may be irreversible
              </h2>
              <p className="mt-2 text-sm leading-6 text-red-900">
                A fully implemented account deletion process may remove your
                profile and associated financial records. Review your
                application's data-retention policy and export any information
                you need before proceeding.
              </p>
            </div>
          </div>
        </section>

        {/* Information */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold">Before deleting your account</h2>

          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="mt-1 shrink-0 text-blue-700"
              />
              Export any transaction or report data you want to keep.
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="mt-1 shrink-0 text-blue-700"
              />
              Check whether shared expenses or other users depend on your account.
            </li>
            <li className="flex items-start gap-3">
              <LockKeyhole
                size={18}
                className="mt-1 shrink-0 text-blue-700"
              />
              A real deletion request should require authenticated server-side
              verification.
            </li>
          </ul>

          <button
            type="button"
            onClick={() => navigate("/reports")}
            className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Go to Reports
          </button>
        </section>

        {/* Deletion request form */}
        <form
          onSubmit={handleContinue}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <h2 className="text-lg font-bold">Deletion request</h2>
          <p className="mt-1 text-sm text-slate-500">
            Confirm your details and review the final warning.
          </p>

          <div className="mt-5">
            <label
              htmlFor="delete-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Account email address
            </label>
            <input
              id="delete-email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your account email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
            />
            <p className="mt-2 text-xs leading-5 text-slate-400">
              This field is for confirmation in the interface. It does not
              verify your identity by itself.
            </p>
          </div>

          <div className="mt-5">
            <label
              htmlFor="delete-reason"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Why are you leaving?
            </label>
            <select
              id="delete-reason"
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50"
            >
              <option value="">Select a reason</option>
              {reasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-red-100 bg-red-50/50 p-4">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-1 h-4 w-4 accent-red-700"
            />
            <span className="text-sm leading-6 text-slate-700">
              I understand that permanent deletion may remove my account and
              associated data, subject to the application's data-retention
              policy.
            </span>
          </label>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => navigate("/settings/account")}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              <Trash2 size={17} />
              Continue to confirmation
            </button>
          </div>
        </form>
      </div>

      {/* Final confirmation */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => !busy && setShowConfirm(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-xl bg-red-50 p-3 text-red-700">
                <Trash2 size={24} />
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
              id="delete-confirm-title"
              className="text-xl font-bold"
            >
              Are you absolutely sure?
            </h2>

            <p className="mt-2 break-words text-sm leading-6 text-slate-500">
              Account: {email}
            </p>

            <p className="mt-3 text-sm leading-6 text-red-700">
              Permanent deletion is not connected yet. Confirming here will
              not delete your account.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Go back
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={handleDeleteRequest}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy ? "Processing..." : "Confirm request"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
