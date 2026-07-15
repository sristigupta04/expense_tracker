import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
export default function Register(){
    const [username,setUser] = useState("");
    const [password,setPass] = useState("");
     const [error,setError] = useState("");
     const [showPassword, setShowPassword] = useState(false);
     const [loading, setLoading] = useState(false);
             const navigate =useNavigate();

    function handleSubmit(e){
        e.preventDefault();
        //handle logic
        setError("");
        setLoading(true);
  if(!username|| !password){
    console.log("invalid");
    setError("Please fill in all fields");
    setLoading(false);
    return;

  }
    if( password.length < 8){
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if(!regex.test(password)){
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
   
      setLoading(false);
      return;
    }
    
  
   console.log({
    username,
    password,
  });
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

