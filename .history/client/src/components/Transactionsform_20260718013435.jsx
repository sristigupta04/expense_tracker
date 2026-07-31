import { useEffect, useState } from "react";
import { useExpense } from "../context/ExpenseContext";

export default function TransactionForm() {
  const { addExpense } = useExpense();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "",
    date: "",
  });

  const [error, setError] = useState("");

  const handle = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  const submit = (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.amount ||
      !formData.category ||
      !formData.type ||
      !formData.date
    ) {
      setError("Please fill all fields");
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    addExpense({
      ...formData,
      amount: Number(formData.amount),
    });

    setFormData({
      title: "",
      amount: "",
      category: "",
      type: "",
      date: "",
    });
  };

  return (
    <form onSubmit={submit}>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handle}
      />

      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={formData.amount}
        onChange={handle}
      />

      <input
        type="text"
        name="category"
        placeholder="Category"
        value={formData.category}
        onChange={handle}
      />

      <select
        name="type"
        value={formData.type}
        onChange={handle}
      >
        <option value="">Select Type</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handle}
      />

      {error && <p>{error}</p>}

      <button type="submit">
        Add Transaction
      </button>
    </form>
  );
}