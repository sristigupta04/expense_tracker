
import { useEffect } from "react";
import { X, Info, CheckCircle2, AlertCircle } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  children,
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="my-auto w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-950/20"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Info size={21} />
            </div>

            <div>
              <h2
                id="modal-title"
                className="text-lg font-bold tracking-tight text-slate-900"
              >
                {title || "Notification"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Expense Tracker
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {message && (
            <p className="mb-5 text-sm leading-6 text-slate-600">
              {message}
            </p>
          )}

          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-slate-900/15"
          >
            <CheckCircle2 size={16} />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
