export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

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