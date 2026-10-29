
export default function formatCurrency(amount) {
  const value = Number(amount);

  if (
    amount === null ||
    amount === undefined ||
    amount === "" ||
    !Number.isFinite(value)
  ) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
