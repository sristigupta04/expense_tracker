 

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
  }
  function deleteBudget(id){
const id = budgets.find((budget)=>{
           budget.id === id
})
 }
  function updateBudget(id, newLimit){

    
return(
    <div>
        
    </div>
)
}