import {
  Pencil,
  Trash2,
  Calendar,
  Tag,
} from "lucide-react";

import formatDate from "../utils/formatDate";
import formatCurrency from "../utils/formatCurrency";

export default function TransactionTable({
  transactions,
  deleteTransaction,
  editTransaction,
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-16">
        <h3 className="text-xl font-semibold text-slate-700">
          No Transactions Found
        </h3>

        <p className="mt-2 text-slate-500">
          Add your first transaction to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl">
      <table className="min-w-full">

        <thead className="bg-slate-100">
          <tr>

            <th className="px-5 py-4 text-left">Title</th>

            <th className="px-5 py-4 text-left">
              Category
            </th>

            <th className="px-5 py-4 text-left">
              Type
            </th>

            <th className="px-5 py-4 text-right">
              Amount
            </th>

            <th className="px-5 py-4 text-left">
              Date
            </th>

            <th className="px-5 py-4 text-center">
              Actions
            </th>

          </tr>
        </thead>

        <tbody>

          {transactions.map((item) => (

            <tr
             key={item._id}
              className="border-b hover:bg-slate-50 transition"
            >

              {/* Title */}

              <td className="px-5 py-4 font-semibold text-slate-800">
                {item.title}
              </td>

              {/* Category */}

              <td className="px-5 py-4">

                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">

                  <Tag size={14} />

                  {item.category}

                </span>

              </td>

              {/* Type */}

              <td className="px-5 py-4">

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    item.type === "income"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.type}
                </span>

              </td>

              {/* Amount */}

              <td
                className={`px-5 py-4 text-right font-bold ${
                  item.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {item.type === "expense" ? "-" : "+"}
                {formatCurrency(item.amount)}
              </td>

              {/* Date */}

              <td className="px-5 py-4">

                <div className="flex items-center gap-2 text-slate-600">

                  <Calendar size={15} />

                  {formatDate(item.date)}

                </div>

              </td>

              {/* Buttons */}

              <td className="px-5 py-4">

                <div className="flex justify-center gap-2">

                  <button
                    onClick={() => editTransaction(item)}
                    className="rounded-lg bg-amber-500 p-2 text-white transition hover:bg-amber-600"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => deleteTransaction(item.id)}
                    className="rounded-lg bg-red-500 p-2 text-white transition hover:bg-red-600"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <div className="border-t bg-slate-50 px-5 py-3 text-sm text-slate-500">
        Showing <span className="font-semibold">{transactions.length}</span> transaction(s)
      </div>
    </div>
  );
}