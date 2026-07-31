import React, { useEffect } from "react";

function App() {
  const [transactions, setTransactions] = React.useState([
    {
      title: "",
      amount: "",
      category: "",
      type: "",
      Date: ""
    }
  ]);

  const [error, setError] = React.useState("");

  // Error ko 3 sec baad hata do
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handle = (e) => {
    // Tumhara handle yahin rahega
  };

  const submit = (e) => {
    e.preventDefault();

    let isvalid = true;

    if (
      !transactions.title ||
      !transactions.amount ||
      !transactions.category ||
      !transactions.type ||
      !transactions.Date
    ) {
      setError("Please fill in all fields");
      isvalid = false;
    }

    if (transactions.amount <= 0) {
      setError("Amount must be greater than 0");
      isvalid = false;
    }

    if (!isvalid) return;

    console.log(transactions);
  };

  return (
    <>
      <form onSubmit={submit}>
        {/* Inputs */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Submit</button>
      </form>
    </>
  );
}