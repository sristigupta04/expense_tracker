
/**
 * Export transactions to a downloadable CSV file.
 */

const CSV_COLUMNS = [
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

// Convert transaction data into CSV content.
export const convertToCSV = (transactions = []) => {
  if (!Array.isArray(transactions)) {
    throw new Error("Transactions must be an array.");
  }

  const header = CSV_COLUMNS.map((column) =>
    escapeCSV(column.label)
  ).join(",");

  const rows = transactions.map((transaction) => {
    return CSV_COLUMNS.map(({ key }) => {
      let value = transaction?.[key];

      if (key === "title") {
        value =
          transaction?.title ??
          transaction?.name ??
          transaction?.description ??
          "";
      }

      if (key === "date" && value) {
        const parsedDate = new Date(value);

        if (!Number.isNaN(parsedDate.getTime())) {
          value = parsedDate.toISOString().slice(0, 10);
        }
      }

      return escapeCSV(value);
    }).join(",");
  });

  // BOM helps spreadsheet software display UTF-8 text correctly.
  return "\uFEFF" + [header, ...rows].join("\r\n");
};

// Download CSV in the browser.
export const exportToCSV = (
  transactions = [],
  filename = "transactions.csv"
) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new Error("No transactions available to export.");
  }

  const csv = convertToCSV(transactions);
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename.toLowerCase().endsWith(".csv")
    ? filename
    : `${filename}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  // Release the temporary download URL after the browser handles it.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Export using today's date in the filename.
export const exportTransactionsCSV = (transactions = []) => {
  const date = new Date().toISOString().slice(0, 10);

  return exportToCSV(
    transactions,
    `expense-tracker-${date}.csv`
  );
};

export default exportTransactionsCSV;
