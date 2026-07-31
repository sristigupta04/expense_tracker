
export default function Login(){
    
    return(
        <form method="POST" action="/login" onSubmit={handlesubmit}>
            <input type="text" name="username" placeholder="Username" />
            <input type="password" name="password" placeholder="Password" />
            <button type="submit" onClick={handlesubmit}>Login</button>
        </form>
    )
}