export default function formatDate(date) {
  if (!date) return "-";

  const formattedDate = new Date(date);

  if (isNaN(formattedDate.getTime())) {
    return "-";
  }

  return formattedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}