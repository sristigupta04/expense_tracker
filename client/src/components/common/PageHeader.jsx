
import { Plus } from "lucide-react";

export default function PageHeader({
  title = "Page Title",
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  children,
  className = "",
}) {
  return (
    <header
      className={`mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {/* Page information */}
      <div className="min-w-0 flex-1">
        <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {/* Page actions */}
      {(children || actionLabel) && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto">
          {children}

          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              disabled={!onAction}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              <ActionIcon size={18} />
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
