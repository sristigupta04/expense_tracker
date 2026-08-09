import { useState } from "react";
import {
  DollarSign,
  Calendar,
  Tag,
  FileText,
} from "lucide-react";

const categories = [
  "Salary",
  "Freelancing",
  "Food",
  "Groceries",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Bills",
  "Travel",
  "Investment",
  "Other",
];

export default function TransactionForm({ addTransaction }) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState("");

  function handle(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

 function submit(e) {
  e.preventDefault();

  setError("");

  const amount = Number(formData.amount);

  if (!formData.title.trim()) {
    setError("Title is required.");
    return;
  }

  if (!formData.amount.trim()) {
    setError("Amount is required.");
    return;
  }

  if (isNaN(amount)) {
    setError("Amount must be a valid number.");
    return;
  }

  if (amount <= 0) {
    setError("Amount must be greater than 0.");
    return;
  }

  if (!formData.category) {
    setError("Please select a category.");
    return;
  }

  addTransaction({
    id: Date.now(),
    ...formData,
    amount,
  });

  setFormData({
    title: "",
    amount: "",
    category: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });
}

  return (
    <form
      onSubmit={submit}
      className="space-y-5"
    >
      {/* Title */}

      <div>
        <label className="mb-2 flex items-center gap-2 font-medium">
          <FileText size={18} />
          Title
        </label>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handle}
          placeholder="Salary, Grocery..."
          className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Amount */}

      <div>
        <label className="mb-2 flex items-center gap-2 font-medium">
          <DollarSign size={18} />
          Amount
        </label>

        <input
          type="text"
          name="amount"
          value={formData.amount}
          onChange={handle}
          placeholder="₹ 0"
          className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Category */}

      <div>
        <label className="mb-2 flex items-center gap-2 font-medium">
          <Tag size={18} />
          Category
        </label>

        <select
          name="category"
          value={formData.category}
          onChange={handle}
          className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">
            Select Category
          </option>

          {categories.map((cat) => (
            <option
              key={cat}
              value={cat}
            >
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Type */}

      <div>
        <label className="mb-2 block font-medium">
          Transaction Type
        </label>

        <div className="grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                type: "income",
              })
            }
            className={`rounded-xl p-3 font-semibold transition ${
              formData.type === "income"
                ? "bg-green-500 text-white"
                : "bg-slate-100"
            }`}
          >
            Income
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                type: "expense",
              })
            }
            className={`rounded-xl p-3 font-semibold transition ${
              formData.type === "expense"
                ? "bg-red-500 text-white"
                : "bg-slate-100"
            }`}
          >
            Expense
          </button>

        </div>
      </div>

      {/* Date */}

      <div>
        <label className="mb-2 flex items-center gap-2 font-medium">
          <Calendar size={18} />
          Date
        </label>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handle}
          className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-100 p-3 text-red-600">
          {error}
        </div>
      )}

      <button
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Add Transaction
      </button>
    </form>
  );
}