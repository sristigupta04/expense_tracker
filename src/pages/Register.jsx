import { useState } from "react";



export default   function Register(){
    const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  function handle(e){
   e.preventDefault();
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);

  }
       <>
       <div>
         
        <form method="GET">
            <div className="img">
           <img src="/" alt="avatar" class="avatar"></img>
            </div>
            <label>Name:</label>
            <input type="text"  placeholder="enter your name" name="name"
            onSubmit={(e)=> setName(e.target.value)} required/>
             <label>Email:</label>
            <input type="email" placeholder="Enter your email" 
             onSubmit={(e)=> setEmail(e.target.value)} required />
            <label >password :</label>
            <input type="password" placeholder="Enter your password"
             onSubmit={(e)=> setPassword(e.target.value)} required/>
             <label>confirm password:</label>
             <input type="cpassword" placeholder="Enter your confirm password" 
              onSubmit={(e)=> setConfirmPassword(e.target.value)}required/>
             <button type="submit">Register button </button>
             <div>
                <p> Already have account? <a href="/login">login </a></p>
             </div>
        </form>
       </div>
       </>
}

export default Register