 

 export default function Budgets(){
  const [budgets, setBudgets] = useState([
    {
      id:1,
      title:"food",
      limit:10000,
      spent:4000
    }
  ]);

  function handlebudget(id){
    const val = budgets.find((b)=>{
      if(b.id === id){
         setBudgets(budgets.filter((b)=>b.id !== id))
      }
    })
  }
  function addBudget(){
       setBudgets([...budgets, {
        id:val.id,
        title:val.title,
        limit:rem,
        spent:val.spent
       }])
    }
  }
  function deleteBudget(id){
    const val = budgets.find((b)=>{
      if(b.id === id){
        setBudgets(budgets.filter((b)=>b.id !== id))
      }
    });

    budgets.delete(val);
  }
  function updateBudget(id, newLimit){

    
return(
    <div>
        
    </div>
)
}