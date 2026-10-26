import { AlertCircle, X } from "lucide-react";

export default function ErrorMessage({
  title = "Something went wrong",
  message = "Please try again.",
  onDismiss,
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
    >
      <AlertCircle
        size={20}
        className="mt-0.5 shrink-0 text-red-600"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-800">
          {title}
        </p>

        <p className="mt-1 break-words text-sm leading-5 text-red-700">
          {message}
        </p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="rounded-lg p-1 text-red-600 transition hover:bg-red-100"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}