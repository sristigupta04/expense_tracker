import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../components/Loader";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  TriangleAlert,
} from "lucide-react";
export default function Register(){
   const [username, setUser] = useState("");
const [email, setEmail] = useState("");
const [password, setPass] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [error, setError] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [loading, setLoading] = useState(false);

const navigate = useNavigate();
   function handleSubmit(e) {
  e.preventDefault();

  setError("");
  setLoading(true);

  if (!username || !email || !password || !confirmPassword) {
    setError("Please fill in all fields.");
    setLoading(false);
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    setError("Please enter a valid email.");
    setLoading(false);
    return;
  }

  if (password.length < 8) {
    setError("Password must be at least 8 characters.");
    setLoading(false);
    return;
  }

  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!regex.test(password)) {
    setError(
      "Password needs uppercase, lowercase, number and special character."
    );
    setLoading(false);
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    setLoading(false);
    return;
  }

  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      username,
      email,
      password,
    })
  );

  setLoading(false);

  navigate("/dashboard");
}


// return key 
return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100 flex items-center justify-center px-4 py-10">

    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-8"
    >

      <h1 className="text-3xl font-bold text-center text-slate-800">
        Create Account
      </h1>

      <p className="mt-2 text-center text-slate-500">
        Welcome to Expense Tracker
      </p>

      <div className="mt-8 space-y-5"></div>


      <div className="relative">

  <User
    size={20}
    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
  />

  <input
    type="text"
    placeholder="Username"
    value={username}
    onChange={(e) => setUser(e.target.value)}
    className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
  />

</div>


<div className="relative">

  <Mail
    size={20}
    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
  />

  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
  />

</div>



<div className="relative">

  <Mail
    size={20}
    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
  />

  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
  />

</div>


<div className="relative">

  <Lock
    size={20}
    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
  />

  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    className="w-full rounded-xl border border-slate-300 pl-12 pr-12 py-3 outline-none transition duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
  />

  <button
    type="button"
    onClick={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
  >
    {showConfirmPassword ? (
      <EyeOff size={20} />
    ) : (
      <Eye size={20} />
    )}
  </button>

</div>


{confirmPassword && (
  <div
    className={`flex items-center gap-2 text-sm font-medium ${
      password === confirmPassword
        ? "text-green-600"
        : "text-red-500"
    }`}
  >
    {password === confirmPassword ? (
      <>
        <CheckCircle size={18} />
        Passwords Match
      </>
    ) : (
      <>
        <TriangleAlert size={18} />
        Passwords Do Not Match
      </>
    )}
  </div>
)}

{error && (
  <div className="flex items-center gap-2 rounded-xl bg-red-100 border border-red-300 p-3 text-red-600">

    <TriangleAlert size={18} />

    <p className="text-sm">{error}</p>

  </div>
)}


<button
  type="submit"
  disabled={loading}
  className="
    flex
    items-center
    justify-center
    gap-2
    w-full
    rounded-xl
    bg-gradient-to-r
    from-blue-600
    to-indigo-600
    py-3
    text-white
    font-semibold
    shadow-lg
    transition-all
    duration-300
    hover:scale-[1.02]
    hover:shadow-xl
    active:scale-95
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
>
  {loading ? (
    <>
      <Loader />
      Registering...
    </>
  ) : (
    "Create Account"
  )}
</button>


<p className="text-center text-slate-600">

  Already have an account?{" "}

  <Link
    to="/login"
    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
  >
    Login
  </Link>

</p>


      </div>

    </form>

  </div>
);
}