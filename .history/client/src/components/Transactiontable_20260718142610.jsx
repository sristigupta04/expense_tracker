import formatDate from "../utils/formatDate";
import formatCurrency from "../utils/formatCurrency";

export default function TransactionTable({
  transactions,
  deleteTransaction,
  editTransaction,
}) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl bg-slate-100 p-8 text-center text-slate-500">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-right">Amount</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((item) => (
            <tr
              key={item.id}
              className="border-b hover:bg-slate-50"
            >
              <td className="p-3 font-medium">
                {item.title}
              </td>

              <td className="p-3">
                {item.category}
              </td>

              <td className="p-3">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    item.type === "income"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.type}
                </span>
              </td>

              <td
                className={`p-3 text-right font-semibold ${
                  item.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(item.amount)}
              </td>

              <td className="p-3">
                {formatDate(item.date)}
              </td>

              <td className="p-3">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => editTransaction(item)}
                    className="rounded-lg bg-yellow-500 px-4 py-2 text-white transition hover:bg-yellow-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteTransaction(item.id)}
                    className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}