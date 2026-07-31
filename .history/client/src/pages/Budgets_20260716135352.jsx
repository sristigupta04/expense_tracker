 

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


}
 function addBudget(newValue){
  const val = budgets.find((budget) => budget.id === budgetId);
  setBudgets(...budgets,newValue);
   if(newValue <budgets.value){
      remining = bugets.value - newvalue;
       setRemining(rem);

   }
   if(newValue > budgets.value){
    remining = newValue - budgets.value;
    setRemining(rem);
 }
 function deleteBudget(budgetId){
  const val = budgets.find((budget) => budget.id === budgetId);
  setBudgets(budgets.filter((budget) => budget.id !== budgetId));
  remining = budgets.value - val.value;
  setRemining(remining);
 }
 function update(budgetId, newValue){
  const val = budgets.find((budget) => budget.id === budgetId);
  setBudgets(budgets.map((budget) => budget.id === budgetId ? {...budget, value: newValue} : budget));
 }
 function editBudget(budgetId, newValue){
  setBudgets(budgets.map((budget) => budget.id === budgetId ? {...budget, value: newValue} : budget));
  setRemining(budgets.value - newValue);
 }
return(
    <div>

    </div>
)
 }