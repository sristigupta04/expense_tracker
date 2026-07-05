import { useState } from "react"




export default function Reports(){
  const [category, setCategory] = useState("");
const [amount, setAmount] = useState("");
const [budgets, setBudgets] = useState([]);
function addBudget() {
  const newBudget = {
    id: Date.now(),
    category,
    amount,
  };

  setBudgets([...budgets, newBudget]);
}
 const spent = 4000;
const remaining = amount - spent;
    return(
        <>
        <div className="pie">pie Charts  </div>
        {/* add budget */}
        
        {/* //budget card */}
<div className="budget-card">
  <ul>
    {budgets.map((item, idx) => (
      <li key={idx}>
        <p>{item.food}</p>
        <p>{item.spent}</p>
        <p>{item.remaining}</p>
      </li>
    ))}
  </ul>
</div>

{/* progress bar */}
<div className="progress-bar">
   
  <p>Budget : ₹{amount}</p>
<p>Spent : ₹{spent}</p>
<p>Remaining : ₹{remaining}</p>
</div>
        </>
    )
}