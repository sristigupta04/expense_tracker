





export default function BudgetProgress({ budget, amount }){
const remaining = budget - spent;
const progress = (spent / budget) * 100;


return (
    <>
    <div>
       <p>Budget: ₹{budget}</p>
<p>Spent: ₹{spent}</p>
<p>Remaining: ₹{remaining}</p>
    </div>
<div className="w-full bg-gray-300 rounded-full h-3">
  <div
    className="bg-green-500 h-3 rounded-full"
    style={{ width: `${progress}%` }}
  ></div>
</div>
</>
)
}

export default BudgetProgress