import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
function handleSubmit(e) {
  e.preventDefault();

  setError("");
  setLoading(true);

  if (!email || !password) {
    setError("Please fill all fields.");
    setLoading(false);
    return;
  }

  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    setError("No registered user found.");
    setLoading(false);
    return;
  }

  if (user.email !== email || user.password !== password) {
    setError("Invalid email or password.");
    setLoading(false);
    return;
  }

  setLoading(false);
  navigate("/dashboard");
}

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={(e) => setPass(e.target.value)}
      />

      <br />
      <br />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? "Hide Password" : "Show Password"}
      </button>

      <br />
      <br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
  {loading ? "Logging in..." : "Login"}
</button>
      <br />
      <br />

    <p>
  Don't have an account?{" "}
  <Link to="/register">Register</Link>
</p>
    </form>
  );
}