
import { AlertCircle, X } from "lucide-react";

export default function ErrorMessage({
  title = "Something went wrong",
  message = "Please try again.",
  onDismiss,
  className = "",
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex min-w-0 items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 ${className}`}
    >
      {/* Error icon */}
      <div className="mt-0.5 shrink-0 text-rose-600">
        <AlertCircle size={20} />
      </div>

      {/* Error content */}
      <div className="min-w-0 flex-1">
        {title && (
          <p className="text-sm font-semibold text-rose-800">
            {title}
          </p>
        )}

        <p className="mt-1 break-words text-sm leading-5 text-rose-700">
          {message}
        </p>
      </div>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="shrink-0 rounded-lg p-1 text-rose-600 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
