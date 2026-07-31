 

 export default function Budgets(){
    const [budgets, setBudgets] = useState([
  {
    id: 1,
    category: "Food",
    limit: 10000,
    spent: 4000
  }
]);

function  handle(budgetId, newvalue){


}
 function addBudget(newValue){
  setBudgets(...budgets,newValue);
   if(newValue <budgets.value){
      rem = bugets.value - newvalue;
       setRemining(rem);
   }
 }
return(
    <div>

    </div>
)
 }