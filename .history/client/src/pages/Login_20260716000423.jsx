import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
export default function Login(){
    const [username,setuser] = useState("");
    const [password,setpass] = useState("");
     const [error,seterror] = useState("");
     const [setpassword,showpassword] = useState(false);
     const [loading, setloading] = useState(false);
             const navigate =useNavigate();

    function handlesubmit(e){
        e.preventDefault();
        //handle logic
        seterror("");
        setloading(true);
  if(!username|| !password){
    console.log("invalid");
    seterror("Please fill in all fields");
    setloading(false);
    return;

  }
    if( password.length < 8){
      seterror("Password must be at least 8 characters long");
      setloading(false);
      return;
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if(!regex.test(password)){
      seterror("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
   
      setloading(false);
      return;
    }
    
  
   console.log({
    username,
    password,
  });
  setloading(false);
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

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "Hide" : "Show"}
  </button>

  <br />

  {error && <p>{error}</p>}

  <button type="submit" disabled={loading}>
    {loading ? "Logging in..." : "Login"}
  </button>

  <br />

  <p>
    Don't have an account?{" "}
    <Link to="/register">Register</Link>
  </p>
</form>
    )
}

