import { useState } from "react";
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
        <form method="POST" action="/login" onSubmit={handlesubmit}>
            <input
            type ="text"
             name="username" 
             placeholder="Username"  
             value={username}
             
             onChange={(e) => setuser(e.target.value)}
             required/>
           <br></br>
            <input 
            type={showpassword? "text":"password"}

            name="password" 
            value ={password}
            placeholder="Password" 
            onChange={(e) => setpass(e.target.value)}
            required />
            <br></br>
            <button type="submit" onClick={()=>showpassword(!)}>Login</button>
             <br></br>
             <p >Don't have an account? <Link to="/register">Register</Link></p>
        </form>
    )
}

