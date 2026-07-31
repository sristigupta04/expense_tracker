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
  return(

<form onSubmit={handleSubmit}>
  <input
    type="text"
    name="username"
    placeholder="Username"
    value={username}
    onChange={(e) => setUser(e.target.value)}
    required
  />

  <br />

  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPass(e.target.value)}
    required
  />

<br></br>
<input type="password"
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
  />
  <br></br>

  {error && <p>{error}</p>}

  <button type="submit" disabled={loading}>
    {loading ? "Registering..." : "Register"}
  </button>

  <br />

  <p>
    Don't have an account?{" "}
    <Link to="/register">Register</Link>
  </p>
</form>
    )
}

