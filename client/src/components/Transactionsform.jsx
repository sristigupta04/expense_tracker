import { useEffect, useState } from "react";

export default function App() {
  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "",
    date: "",
  });

  // All Transactions
  const [transactions, setTransactions] = useState([]);

  // Error
  const [error, setError] = useState("");

  // Handle Input
  const handle = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto remove error after 3 sec
  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  // Submit Form
  const submit = (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.amount ||
      !formData.category ||
      !formData.type ||
      !formData.date
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    // Add new transaction
    setTransactions((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...formData,
      },
    ]);

    console.log("Transactions:", transactions);

    // Clear Form
    setFormData({
      title: "",
      amount: "",
      category: "",
      type: "",
      date: "",
    });
  };

  return (
    <>
      <form onSubmit={submit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handle}
          />

          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handle}
          />

          <label>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handle}
          />

          <label>Type</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handle}
          />

          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handle}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Add Transaction</button>
      </form>

      <hr />

      <h2>Transactions</h2>

      {transactions.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>₹ {item.amount}</p>
          <p>{item.category}</p>
          <p>{item.type}</p>
          <p>{item.date}</p>
        </div>
      ))}
    </>
  );
}