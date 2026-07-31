import { useEffect, useState } from "react";

function App() {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  // handleSubmit()
  const submit = (e) => {
    e.preventDefault();

    if (/* validation fail */) {
      setError("Please fill in all fields");
      return;
    }

    console.log("Form Submitted");
  };

  return (
    <>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
}

export default App;