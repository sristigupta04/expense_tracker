import { useState } from "react";
export default function Login(){
    const [username,setuser] = useState("");
    const [password,setpass] = useState("");
     const [error,seterror] = useState("");
     const [loading, setLoading] = useState(false);
     const [showPassword, setShowPassword] = useState(false);
    function handlesubmit(e){
        e.preventDefault();
        //handle logic
    username(e.target.value)
  if(!username|| !password){
    console.log("invalid");
    setloading(false);
    return seterror("Please fill in all fields");

  }else {
    if( password.length < 12 ){
      return seterror("Password must be at least 12 characters long");
    }
    else {
        
    }
  }

        console.log(username,password);
        
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

