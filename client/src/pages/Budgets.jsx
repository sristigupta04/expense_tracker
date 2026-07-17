 

 export default function Budgets(){
  const [budgets, setBudgets] = useState([
    {
      id:1,
      title:"food",
      limit:10000,
      spent:4000
    }
  ]);

  function addBudget(){
const newValue =  prompt("enter your new budget limit");
       setBudgets([...budgets, {
        id:budgets.length + 1,
        title:prompt("enter your new budget title"),
        limit:Number(newValue),
        spent:0
       }])
    }
  
  function deleteBudget(id){
const id = budgets.find((budget)=>{
           budget.id === id
});
setBudgets(budgets.filter((budget)=> budget.id !== id));

 }



 function editBudget(id){
setBudgets(budgets.map((b)=>{
  if(b.id === id){
    const newtitle = prompt("enter new title");
    const newlimit = Number(prompt("enter new limit"));
    return{
      ...b,
      title:newtitle,
      limit:newlimit
    }
  }
}));

 }
return(
    <div>
         <button onClick={addBudget}>Add Budget</button>
         <BudgetsList budgets={budgets} deleteBudget={deleteBudget} editBudget={editBudget}/>
    </div>
)
}