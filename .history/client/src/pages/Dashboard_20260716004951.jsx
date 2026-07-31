

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
function handleSubmit(e){
   e.preventDefault();
   let title = e.target.title.value;
   let amount = e.target.amount.value;
   let type = e.target.type.value;
   const transaction = {
      id: transactions.length + 1,
      title,
      amount,
      type
   }
   addTransaction(transaction);
}
function addTransaction(transaction){
   
setTransactions([...transactions, transaction]);

if(transaction.type === "income"){
    setIncome(income + transaction.amount)
   }
if(transaction.type === "expense"){
      setExpense(expense + transaction.amount)
   }
<button OnClick={addTransaction}>Add Transaction</button>
}

function deleteTransaction(id){
   const transaction = transactions.find((transaction) =>{
      transaction.id === id
   })
   setTransactions(transactions.filter((transaction) => transaction.id !== id));
   if(transaction.type === "income"){
    setIncome(income -transaction.amount)
   }
if(transaction.type === "expense"){
      setExpense(expense  - transaction.amount)
   }
<button OnClick={() => deleteTransaction(transaction.id)}>Delete Transaction</button>
}

function editTransaction(id, update){
   const  edit = transactions.find((transaction) => transaction.id === id);
   setTransactions(transactions.map((transaction) => transaction.id === id ? {...transaction, ...update} : transaction));
    if(transaction.type === "income"){
    setIncome(income  + transaction.amount)
   }
if(transaction.type === "expense"){
      setExpense(expense   +transaction.amount)
   }
   <button OnClick={() => editTransaction(transaction.id, {title: "New Title", amount: 1000})}>Edit Transaction</button>
}
return(
<form onSubmit={handleSubmit}>
<input type="text" placeholder="Title" />
<input type="number" placeholder="Amount" />
<button type="submit">Add Transaction</button>

</form>
)












}