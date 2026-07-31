

export default function Dashboard() {
  const [balance, setBalance] = useState(25000);
const [income, setIncome] = useState(40000);
const [expense, setExpense] = useState(15000);

const [transactions, setTransactions] = useState([
  {
    id: 1,
    title: "Salary",
    amount: 30000,
    type: "income"
  },
  {
    id: 2,
    title: "Food",
    amount: 500,
    type: "expense"
  }
]);
// function area
function addTransaction(transaction){
<form method="post" onSubmit={addTransaction}>
     e.preventDefault();
if(transaction.type === "income"){
    setIncome(income + transaction.amount)
   }
   if(transaction.type === "expense"){
      setExpense(expense + transaction.amount)
   }
      <button OnClick={addTransaction}>Add Transaction</button>

   </form>
}













}