
export default function Loader({
  size = "h-7 w-7",
  color = "border-blue-600",
  text = "",
  fullScreen = false,
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${
        fullScreen
          ? "fixed inset-0 z-[100] min-h-screen bg-white/80 backdrop-blur-sm"
          : "py-3"
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`${size} shrink-0 animate-spin rounded-full border-[3px] ${color} border-t-transparent`}
        aria-hidden="true"
      />

      {text && (
        <span className="text-sm font-medium text-slate-600">
          {text}
        </span>
      )}

      <span className="sr-only">
        {text || "Loading, please wait..."}
      </span>
    </div>
  );
}
