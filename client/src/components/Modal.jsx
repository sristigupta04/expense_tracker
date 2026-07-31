import { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  children,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl font-bold text-slate-500 transition hover:text-red-500"
          >
            ×
          </button>
        </div>

        {message && (
          <p className="mb-5 text-slate-600">
            {message}
          </p>
        )}

        <div className="mb-6">
          {children}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-red-500 px-5 py-2 font-medium text-white transition hover:bg-red-600 active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}