 

 export default function Budgets(){
    const [budgets, setBudgets] = useState([
  {
    id: 1,
    category: "Food",
    limit: 10000,
    spent: 4000
  }
]);
const [remaining, setRemaining] = useState(0);
function  handle(budgetId, newvalue){
  const budget = budgets.find((b)=>{
    b.id === budgetId
  })
 if(budget.limit < newValue){
setRemaining(remaining -(newvalue - budget.limit));

setBudgets(budget.map((budget)=>{
  if(budget.id === budgetId){
    return {...budget,limit:newvalue}
  }
}))
}
}
 function addBudget(id){
  const val = budgets.find((b) => b.id === id);
  setBudgets(...budgets,newValue);
   if(newValue <budgets.value){
      remaining = bugets.value - newvalue;
       setRemaining(remaining);

   }
   if(newValue > budgets.value){
    remaining = newValue - budgets.value;
    setRemaining(remaining);
 }
 function deleteBudget(budgetId){
  const val = budgets.find((budget) => budget.id === budgetId);
  setBudgets(budgets.filter((budget) => budget.id !== budgetId));
  remaining = budgets.value - val.value;
  setRemaining(remaining);
 }
 function update(budgetId, newValue){
  const val = budgets.find((budget) => budget.id === budgetId);
  setBudgets(budgets.map((budget) => budget.id === budgetId ? {...budget, value: newValue} : budget));
 }
 function editBudget(budgetId, newValue){
  setBudgets(budgets.map((budget) => budget.id === budgetId ? {...budget, value: newValue} : budget));
  setRemaining(budgets.value - newValue);
 }
}
return(
    <div>
        
    </div>
)
}