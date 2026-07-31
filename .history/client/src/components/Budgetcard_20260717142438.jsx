
import ProgressBar from "./ProgressBar";

function BudgetCard({ budget }) {
  const { category, limit, spent } = budget;

  const remaining = limit - spent;
  const percentage = (spent / limit) * 100;

  return (
    <div>
      <h3>{category}</h3>

      <p>Limit : ₹{limit}</p>

      <p>Spent : ₹{spent}</p>

      <p>Remaining : ₹{remaining}</p>

      <ProgressBar
        limit={limit}
        spent={spent}
        percentage={percentage}
      />
    </div>
  );
}








function App(){
    const [budget] = useState([
 {category:"Food", limit:10000, spent:4000},

 {category:"Travel", limit:5000, spent:2000},

 {category:"Shopping", limit:8000, spent:7000}
]);
return(
    <>
    {budget.map((item) => (
        <BudgetCard 
        key={item.category}
         budget={item} />
    ))}
    </>
)
}
export default BudgetCard;
