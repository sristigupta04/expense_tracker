
import { useEffect } from "react";
import { X, Info, CheckCircle2 } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title = "Notification",
  message,
  children,
  closeLabel = "Close",
  showFooter = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  maxWidth = "max-w-md",
}) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose?.();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (
      closeOnBackdrop &&
      event.target === event.currentTarget
    ) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={message ? "modal-description" : undefined}
        className={`my-auto w-full ${maxWidth} animate-in fade-in zoom-in-95 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 duration-200`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Info size={21} />
            </div>

            <div className="min-w-0">
              <h2
                id="modal-title"
                className="break-words text-lg font-bold tracking-tight text-slate-900"
              >
                {title}
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-6 sm:px-6">
          {message && (
            <p
              id="modal-description"
              className="mb-5 text-sm leading-6 text-slate-600"
            >
              {message}
            </p>
          )}

          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <CheckCircle2 size={16} />
              {closeLabel}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
