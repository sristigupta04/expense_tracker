 

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
const rem = budget.limit -budgets.spent;

function  handle(budgetId, newvalue){
  const budget = budgets.find((b)=>{
    b.id === budgetId
  })
 if(budget.limit < newvalue){;

setBudgets(budget.map((budget)=>{
  if(budget.id === budgetId){
    rem = budget.limit -newvalue
    return {...budget,limit:newvalue}
  }
}))
}
}
 function addBudget(id){
  const val = budgets.find((b) => b.id === id);
  setBudgets(...budgets,newvalue);
   if(newvalue <budgets.value){
rem = budgets.value - newvalue;
   }
   if(newValue > budgets.value){
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