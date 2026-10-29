
export default function formatDate(date) {
  if (!date) return "-";

  let formattedDate;

  // Handle YYYY-MM-DD without timezone shifting.
  if (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    const [year, month, day] = date.split("-").map(Number);
    formattedDate = new Date(year, month - 1, day);
  } else {
    formattedDate = new Date(date);
  }

  if (Number.isNaN(formattedDate.getTime())) {
    return "-";
  }

  return formattedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
