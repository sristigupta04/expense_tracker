import { useState } from "react";
export default function Login(){
    const [username,setuser] = useState("");
    const [password,setpass] = useState("");
     const [error,seterror] = useState("");
     const [loading, setLoading] = useState(false);
     const [showPassword, setShowPassword] = useState(false);
    function handlesubmit(e){
        e.preventDefault();
        useNavgigate("/dashboard");
        //handle logic

  if(!username|| !password){
    console.log("invalid");
    setloading(false);
    return seterror("Please fill in all fields");

  }else {
    if( password.length < 12 ){

      return seterror("Password must be at least 12 characters long");
      setloading(false);
    }
    if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/ )) {
      return seterror("Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character");
      setloading(false);
    }
    
  }
  return seterror("login successfull");
  setloading(true);
  res.status(201).json({message:succes});
}

  return(
        <form method="POST" action="/login" onSubmit={handlesubmit}>
            <input type="text"
             name="username" 
             placeholder="Username"  
             value={username}
             onChange={(e) => setuser(e.target.value)}
             required/>
           <br></br>
            <input type="password" 
            name="password" 
            value ={password}
            placeholder="Password" 
            onChange={(e) => setpass(e.target.value)}
            required />
            <br></br>
            <button type="submit">Login</button>
             <br></br>
             <p >Don't have an account? <a href="/register">Register</a></p>
        </form>
    )
}

