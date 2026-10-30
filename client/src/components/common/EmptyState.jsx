
import { ReceiptText } from "lucide-react";

export default function EmptyState({
  icon: Icon = ReceiptText,
  title = "Nothing here yet",
  description = "Your data will appear here when you add your first record.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center ${className}`}
    >
      {/* Icon */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={27} strokeWidth={1.8} />
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>

      {/* Optional action */}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
