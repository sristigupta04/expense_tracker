import { useState } from "react";

export default function TransactionsForm() {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "",
    date: "",
  });

  const [error, setError] = useState("");

  function handle(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function submit(e) {
    e.preventDefault();

    // your logic
  }
return (
  <form onSubmit={submit} className="space-y-6">

    <div className="grid gap-5 md:grid-cols-2">

      <div>
        <label className="mb-2 block font-medium text-slate-700">
          Title
        </label>

        <input
          type="text"
          name="title"
          placeholder="Enter title"
          value={formData.title}
          onChange={handle}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium text-slate-700">
          Amount
        </label>

        <input
          type="number"
          name="amount"
          placeholder="Enter amount"
          value={formData.amount}
          onChange={handle}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium text-slate-700">
          Category
        </label>

        <input
          type="text"
          name="category"
          placeholder="Food, Salary, Travel..."
          value={formData.category}
          onChange={handle}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium text-slate-700">
          Type
        </label>

        <select
          name="type"
          value={formData.type}
          onChange={handle}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
        >
          <option value="">Select Type</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block font-medium text-slate-700">
          Date
        </label>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handle}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
        />
      </div>

    </div>

    {error && (
      <div className="rounded-xl border border-red-300 bg-red-100 p-3 text-red-600">
        {error}
      </div>
    )}

    <button
      type="submit"
      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl active:scale-95"
    >
      Add Transaction
    </button>

  </form>
);