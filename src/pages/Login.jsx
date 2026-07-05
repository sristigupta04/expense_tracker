


 export default function Login() {
   const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    function handle(Elem) {
        Elem.preventDefault();
        console.log("email",email);
        console.log("password",password);

    }
    return (
    <>
    <div>
        <img src="/"></img>
    </div>
    <form onSubmit={handle}>
    <div className="login">

        <label type="email">Email :</label>
        <input type="text" 
        placeholder="enter your email"
        onChange={(e)=>setEmail(e.target.value)}
         name="email"
          required/>
         <label type="password">password :</label>
        <input type="password" 
        placeholder="enter your password"
        onChange={(e)=>setPassword(e.target.value)}
         name="password" required/>
        <button color="{Color.Success}"type="submit"> Login</button>
    </div>
      
      <p>" Don't have an account?"
         <a href="/register">Register link</a>
         </p>

    <div className=" forget">
        <span class="psw">
            Forgot <a href="#">password?</a>
            </span>
    </div>
    </form>
    </>
    )
 }
 export default Login