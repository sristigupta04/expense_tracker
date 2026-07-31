

export default function Navbar(){
    return(
        <>
        <div ClassName="navbar">
            <h1>expense Tracker</h1>
            <p>Track your expenses</p>
            <div className="link">
            <Link to="/transactions">Transactions</Link>
</div>
        </div>
    
        </>
    )
}