
import api from "./api";

// Fetch transaction data for export
export const getExportTransactions = async (params = {}) => {
  const response = await api.get("/transactions", { params });

  const data = response.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.transactions)) return data.transactions;

  return [];
};

// Convert transactions to CSV and download it
export const exportTransactionsCSV = (transactions = []) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new Error("No transactions available to export.");
  }

  const columns = [
    { key: "title", label: "Title" },
    { key: "type", label: "Type" },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
    { key: "description", label: "Description" },
  ];

  const escapeCSV = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const rows = [
    columns.map((column) => escapeCSV(column.label)).join(","),
    ...transactions.map((transaction) =>
      columns
        .map((column) => {
          const value =
            column.key === "title"
              ? transaction.title ?? transaction.name ?? ""
              : transaction[column.key] ?? "";

          return escapeCSV(value);
        })
        .join(",")
    ),
  ];

  const csv = "\uFEFF" + rows.join("\r\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `transactions-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};
