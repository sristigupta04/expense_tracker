
export default function Login(){
    const [username,setuser] = useState("");
    const [password,setpass] = useState("");

    function handlesubmit(e){
        e.preventDefault();
        //handle logic
        console.log(username,password);
    }
    return(
        <form method="POST" action="/login" onSubmit={handlesubmit}>
            <input type="text"
             name="username" 
             placeholder="Username"  
             onChange={e.target.value}
             required/>
           <br></br>
            <input type="password" 
            name="password" 
            placeholder="Password" 
            required />
            <br></br>
            <button type="submit"
             onClick={handlesubmit}>Login</button>
        </form>
    )
}