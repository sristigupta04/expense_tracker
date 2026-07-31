export default function Loader({
  size = "h-6 w-6",
  color = "border-white",
}) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${size}
          animate-spin
          rounded-full
          border-4
          ${color}
          border-t-transparent
        `}
      />
    </div>
  );
}