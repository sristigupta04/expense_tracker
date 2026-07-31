
import Link from "react-router-dom";
export default function Navbar(){
    return(
        <>
        <div className="navbar">
            <h1>expense Tracker</h1>
            <p>Track your expenses</p>
            <div className="link">
                <Link to="/Dashboard">Dashboard</Link>
                <Link to="/transactions">Transactions</Link>
                <Link to="/budget">Budget</Link>
                <Link to="/reports">Reports</Link>
            </div>

        </div>
    
        </>
    )
}