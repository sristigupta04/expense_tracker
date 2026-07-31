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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-200 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-8 sm:p-10"
      >
        <h1 className="text-3xl font-bold text-center text-slate-800">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-sm text-slate-500">
          Login to your Expense Tracker
        </p>

        <div className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {showPassword ? "Hide Password" : "Show Password"}
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-red-100 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Register
            </Link>
          </p>

        </div>
      </form>
    </div>
  );
}