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

  <Lock
    size={20}
    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
  />

  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPass(e.target.value)}
    className="w-full rounded-xl border border-slate-300 pl-12 pr-12 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>

</div>